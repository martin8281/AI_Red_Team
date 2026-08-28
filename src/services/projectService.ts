import { 
  Project, 
  ScopeAsset, 
  ProjectActivityItem, 
  ProjectSortOption 
} from '../types/project.types';
import { 
  initialMockProjects, 
  initialMockScopeAssets, 
  initialMockActivities 
} from '../data/mockProjects';

const STORAGE_KEY_PROJECTS = 'art_projects_data';
const STORAGE_KEY_SCOPE = 'art_scope_assets_data';
const STORAGE_KEY_ACTIVITIES = 'art_project_activities_data';

class ProjectService {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockProjects;
  }

  private saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch {
      // ignore
    }
  }

  private loadScopeAssets(): ScopeAsset[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SCOPE);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockScopeAssets;
  }

  private saveScopeAssets(assets: ScopeAsset[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SCOPE, JSON.stringify(assets));
    } catch {
      // ignore
    }
  }

  private loadActivities(): ProjectActivityItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockActivities;
  }

  private saveActivities(activities: ProjectActivityItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    } catch {
      // ignore
    }
  }

  // --- Project CRUD ---

  async getProjects(filters?: {
    search?: string;
    status?: string;
    sort?: ProjectSortOption;
  }): Promise<Project[]> {
    await this.delay(200);
    let list = this.loadProjects();

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.organization.toLowerCase().includes(q) ||
          p.projectType.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'risk_score':
          list.sort((a, b) => b.riskScore - a.riskScore);
          break;
        case 'finding_count':
          list.sort((a, b) => b.findingCount - a.findingCount);
          break;
        case 'recently_updated':
        default:
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          break;
      }
    }

    return list;
  }

  async getProjectById(id: string): Promise<Project | null> {
    await this.delay(200);
    const list = this.loadProjects();
    return list.find((p) => p.id === id) || null;
  }

  async createProject(
    projectData: Omit<
      Project,
      'id' | 'createdAt' | 'updatedAt' | 'progress' | 'findingCount' | 'criticalFindingCount' | 'highFindingCount' | 'mediumFindingCount' | 'lowFindingCount' | 'riskScore'
    >
  ): Promise<Project> {
    await this.delay(400);
    const list = this.loadProjects();
    const now = new Date().toISOString();

    const newProject: Project = {
      ...projectData,
      id: `PRJ-${Date.now().toString().slice(-4)}`,
      progress: projectData.status === 'ACTIVE' ? 10 : 0,
      findingCount: 0,
      criticalFindingCount: 0,
      highFindingCount: 0,
      mediumFindingCount: 0,
      lowFindingCount: 0,
      riskScore: 0,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newProject);
    this.saveProjects(list);

    // Record creation activity
    const activities = this.loadActivities();
    activities.unshift({
      id: `act-${Date.now()}`,
      projectId: newProject.id,
      timestamp: 'Just now',
      title: 'Project Initialized',
      description: `Engagement initialized under ${newProject.organization}.`,
      type: 'creation',
    });
    this.saveActivities(activities);

    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await this.delay(300);
    const list = this.loadProjects();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveProjects(list);
    return list[index];
  }

  async deleteProject(id: string): Promise<boolean> {
    await this.delay(300);
    let list = this.loadProjects();
    const initialLen = list.length;
    list = list.filter((p) => p.id !== id);
    this.saveProjects(list);
    return list.length < initialLen;
  }

  // --- Scope Assets CRUD ---

  async getScopeAssets(projectId: string): Promise<ScopeAsset[]> {
    await this.delay(200);
    const all = this.loadScopeAssets();
    return all.filter((a) => a.projectId === projectId);
  }

  async addScopeAsset(
    assetData: Omit<ScopeAsset, 'id' | 'createdAt'>
  ): Promise<ScopeAsset> {
    await this.delay(300);
    const all = this.loadScopeAssets();
    const newAsset: ScopeAsset = {
      ...assetData,
      id: `ast-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    all.push(newAsset);
    this.saveScopeAssets(all);

    // Record activity
    const activities = this.loadActivities();
    activities.unshift({
      id: `act-${Date.now()}`,
      projectId: assetData.projectId,
      timestamp: 'Just now',
      title: 'Scope Asset Added',
      description: `Added ${assetData.scopeStatus === 'IN_SCOPE' ? 'in-scope' : 'out-of-scope'} asset: ${assetData.value} (${assetData.assetType}).`,
      type: 'scope',
    });
    this.saveActivities(activities);

    return newAsset;
  }

  async updateScopeAsset(
    id: string,
    updates: Partial<ScopeAsset>
  ): Promise<ScopeAsset | null> {
    await this.delay(250);
    const all = this.loadScopeAssets();
    const index = all.findIndex((a) => a.id === id);
    if (index === -1) return null;

    all[index] = {
      ...all[index],
      ...updates,
    };

    this.saveScopeAssets(all);
    return all[index];
  }

  async deleteScopeAsset(id: string): Promise<boolean> {
    await this.delay(250);
    let all = this.loadScopeAssets();
    const initialLen = all.length;
    all = all.filter((a) => a.id !== id);
    this.saveScopeAssets(all);
    return all.length < initialLen;
  }

  // --- Project Activities ---

  async getProjectActivities(projectId: string): Promise<ProjectActivityItem[]> {
    await this.delay(150);
    const all = this.loadActivities();
    return all.filter((act) => act.projectId === projectId);
  }
}

export const projectService = new ProjectService();
