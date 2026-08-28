import { 
  Finding, 
  Evidence, 
  FindingSortOption, 
  FindingStatsData,
  Severity,
  FindingStatus,
  Priority
} from '../types/finding.types';
import { initialMockFindings, initialMockEvidence } from '../data/mockFindings';
import { projectService } from './projectService';

const STORAGE_KEY_FINDINGS = 'art_findings_data';
const STORAGE_KEY_EVIDENCE = 'art_evidence_data';

class FindingService {
  private delay(ms = 250): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadFindings(): Finding[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_FINDINGS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockFindings;
  }

  private saveFindings(findings: Finding[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_FINDINGS, JSON.stringify(findings));
    } catch {
      // ignore
    }
  }

  private loadEvidence(): Evidence[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_EVIDENCE);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockEvidence;
  }

  private saveEvidence(evidence: Evidence[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_EVIDENCE, JSON.stringify(evidence));
    } catch {
      // ignore
    }
  }

  // --- Finding CRUD ---

  async getFindings(filters?: {
    search?: string;
    projectId?: string;
    severity?: string;
    status?: string;
    priority?: string;
    sort?: FindingSortOption;
  }): Promise<Finding[]> {
    await this.delay(200);
    let list = this.loadFindings();

    if (filters?.projectId && filters.projectId !== 'ALL') {
      list = list.filter((f) => f.projectId === filters.projectId);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.vulnerabilityType.toLowerCase().includes(q) ||
          f.asset.toLowerCase().includes(q) ||
          f.endpoint.toLowerCase().includes(q) ||
          (f.projectName && f.projectName.toLowerCase().includes(q))
      );
    }

    if (filters?.severity && filters.severity !== 'ALL') {
      list = list.filter((f) => f.severity === filters.severity);
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((f) => f.status === filters.status);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((f) => f.priority.startsWith(filters.priority!));
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'highest_risk':
          list.sort((a, b) => b.riskScore - a.riskScore);
          break;
        case 'severity': {
          const rank: Record<Severity, number> = {
            CRITICAL: 5,
            HIGH: 4,
            MEDIUM: 3,
            LOW: 2,
            INFORMATIONAL: 1,
          };
          list.sort((a, b) => rank[b.severity] - rank[a.severity]);
          break;
        }
        case 'recently_updated':
        default:
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          break;
      }
    }

    return list;
  }

  async getFindingById(id: string): Promise<Finding | null> {
    await this.delay(200);
    const list = this.loadFindings();
    return list.find((f) => f.id === id) || null;
  }

  async getFindingsByProjectId(projectId: string): Promise<Finding[]> {
    await this.delay(150);
    const list = this.loadFindings();
    return list.filter((f) => f.projectId === projectId);
  }

  async createFinding(
    findingData: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>,
    initialEvidence?: Omit<Evidence, 'id' | 'findingId' | 'createdAt'>[]
  ): Promise<Finding> {
    await this.delay(400);
    const list = this.loadFindings();
    const now = new Date().toISOString();

    // Fetch project title if missing
    let projectName = findingData.projectName;
    if (!projectName && findingData.projectId) {
      const parentProject = await projectService.getProjectById(findingData.projectId);
      if (parentProject) {
        projectName = parentProject.name;
      }
    }

    const newFinding: Finding = {
      ...findingData,
      projectName: projectName || 'General Pentest',
      id: `FND-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newFinding);
    this.saveFindings(list);

    // Save initial evidence if provided
    if (initialEvidence && initialEvidence.length > 0) {
      const allEvidence = this.loadEvidence();
      initialEvidence.forEach((evi, index) => {
        allEvidence.unshift({
          ...evi,
          id: `evi-${Date.now()}-${index}`,
          findingId: newFinding.id,
          createdAt: now,
        });
      });
      this.saveEvidence(allEvidence);
    }

    return newFinding;
  }

  async updateFinding(id: string, updates: Partial<Finding>): Promise<Finding | null> {
    await this.delay(300);
    const list = this.loadFindings();
    const index = list.findIndex((f) => f.id === id);
    if (index === -1) return null;

    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveFindings(list);
    return list[index];
  }

  async deleteFinding(id: string): Promise<boolean> {
    await this.delay(300);
    let list = this.loadFindings();
    const initialLen = list.length;
    list = list.filter((f) => f.id !== id);
    this.saveFindings(list);

    // Also delete associated evidence
    let evidence = this.loadEvidence();
    evidence = evidence.filter((e) => e.findingId !== id);
    this.saveEvidence(evidence);

    return list.length < initialLen;
  }

  // --- Evidence CRUD ---

  async getFindingEvidence(findingId: string): Promise<Evidence[]> {
    await this.delay(150);
    const all = this.loadEvidence();
    return all.filter((e) => e.findingId === findingId);
  }

  async addEvidence(
    evidenceData: Omit<Evidence, 'id' | 'createdAt'>
  ): Promise<Evidence> {
    await this.delay(300);
    const all = this.loadEvidence();
    const newEvidence: Evidence = {
      ...evidenceData,
      id: `evi-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };

    all.push(newEvidence);
    this.saveEvidence(all);
    return newEvidence;
  }

  async deleteEvidence(evidenceId: string): Promise<boolean> {
    await this.delay(250);
    let all = this.loadEvidence();
    const initialLen = all.length;
    all = all.filter((e) => e.id !== evidenceId);
    this.saveEvidence(all);
    return all.length < initialLen;
  }

  // --- Statistics Calculation ---

  async getFindingStats(projectId?: string): Promise<FindingStatsData> {
    await this.delay(150);
    let list = this.loadFindings();
    if (projectId && projectId !== 'ALL') {
      list = list.filter((f) => f.projectId === projectId);
    }

    const stats: FindingStatsData = {
      total: list.length,
      bySeverity: {
        critical: list.filter((f) => f.severity === 'CRITICAL').length,
        high: list.filter((f) => f.severity === 'HIGH').length,
        medium: list.filter((f) => f.severity === 'MEDIUM').length,
        low: list.filter((f) => f.severity === 'LOW').length,
        informational: list.filter((f) => f.severity === 'INFORMATIONAL').length,
      },
      byStatus: {
        open: list.filter((f) => f.status === 'OPEN').length,
        inReview: list.filter((f) => f.status === 'IN_REVIEW').length,
        remediation: list.filter((f) => f.status === 'REMEDIATION').length,
        resolved: list.filter((f) => f.status === 'RESOLVED').length,
        acceptedRisk: list.filter((f) => f.status === 'ACCEPTED_RISK').length,
        reopened: list.filter((f) => f.status === 'REOPENED').length,
      },
    };

    return stats;
  }
}

export const findingService = new FindingService();
