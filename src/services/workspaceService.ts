import { 
  EngagementState, 
  HealthStatus, 
  EngagementHealth, 
  AssessmentChecklist, 
  RecommendedAction, 
  WorkspaceActivity, 
  WorkspaceOverview, 
  FindingStatsSummary, 
  EvidenceStatsSummary,
  RemediationStatus,
  EvidenceVerificationStatus
} from '../types/workspace.types';
import { Project } from '../types/project.types';
import { Finding, Priority, Severity } from '../types/finding.types';
import { projectService } from './projectService';
import { findingService } from './findingService';
import { riskService } from './riskService';
import { reportService } from './reportService';

const STORAGE_KEY_ENGAGEMENT_STATES = 'art_engagement_states';
const STORAGE_KEY_ACTIVITIES = 'art_workspace_activities';

export const VALID_TRANSITIONS: Record<EngagementState, EngagementState[]> = {
  PLANNING: ['SCOPING', 'ARCHIVED'],
  SCOPING: ['ASSESSMENT', 'PLANNING', 'ARCHIVED'],
  ASSESSMENT: ['ANALYSIS', 'SCOPING', 'ARCHIVED'],
  ANALYSIS: ['REMEDIATION', 'ASSESSMENT', 'ARCHIVED'],
  REMEDIATION: ['REPORTING', 'ANALYSIS', 'ARCHIVED'],
  REPORTING: ['COMPLETED', 'REMEDIATION', 'ARCHIVED'],
  COMPLETED: ['REPORTING', 'ARCHIVED'],
  ARCHIVED: ['PLANNING', 'ASSESSMENT'],
};

class WorkspaceService {
  private delay(ms = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadStates(): Record<string, EngagementState> {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ENGAGEMENT_STATES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return {
      'PRJ-101': 'ASSESSMENT',
      'PRJ-102': 'SCOPING',
      'PRJ-103': 'REMEDIATION',
      'PRJ-104': 'PLANNING',
    };
  }

  private saveStates(states: Record<string, EngagementState>): void {
    try {
      localStorage.setItem(STORAGE_KEY_ENGAGEMENT_STATES, JSON.stringify(states));
    } catch {
      // ignore
    }
  }

  private loadActivities(): WorkspaceActivity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return [
      {
        id: 'ACT-001',
        projectId: 'PRJ-101',
        entityType: 'FINDING',
        entityId: 'FND-201',
        action: 'FINDING_CREATED',
        description: 'Logged Critical finding: Blind Boolean-Based SQL Injection on authentication endpoint.',
        createdAt: '2026-08-27T09:18:00.000Z',
      },
      {
        id: 'ACT-002',
        projectId: 'PRJ-101',
        entityType: 'RISK',
        entityId: 'RA-201',
        action: 'RISK_UPDATED',
        description: 'Deterministic risk engine evaluated finding FND-201 at 92/100 (CRITICAL).',
        createdAt: '2026-08-27T09:42:00.000Z',
      },
      {
        id: 'ACT-003',
        projectId: 'PRJ-101',
        entityType: 'REPORT',
        entityId: 'RPT-101',
        action: 'REPORT_GENERATED',
        description: 'Compiled deliverable: Apex Financial Services — Q3 Web Application Security Assessment v1.0.',
        createdAt: '2026-08-27T09:50:00.000Z',
      },
    ];
  }

  private saveActivities(activities: WorkspaceActivity[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    } catch {
      // ignore
    }
  }

  async logActivity(activity: Omit<WorkspaceActivity, 'id' | 'createdAt'>): Promise<void> {
    const list = this.loadActivities();
    const newAct: WorkspaceActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      ...activity,
    };
    list.unshift(newAct);
    this.saveActivities(list);
  }

  async getEngagementState(projectId: string): Promise<EngagementState> {
    const states = this.loadStates();
    return states[projectId] || 'ASSESSMENT';
  }

  async transitionEngagementState(
    projectId: string,
    newState: EngagementState
  ): Promise<{ success: boolean; message: string; state: EngagementState }> {
    await this.delay(200);
    const states = this.loadStates();
    const currentState = states[projectId] || 'PLANNING';

    if (currentState === newState) {
      return { success: true, message: `Engagement already in ${newState} state.`, state: currentState };
    }

    const allowed = VALID_TRANSITIONS[currentState] || [];
    if (!allowed.includes(newState)) {
      return {
        success: false,
        message: `Invalid transition from ${currentState} to ${newState}. Allowed targets: ${allowed.join(', ')}.`,
        state: currentState,
      };
    }

    states[projectId] = newState;
    this.saveStates(states);

    await this.logActivity({
      projectId,
      entityType: 'PROJECT',
      entityId: projectId,
      action: 'PROJECT_STATUS_CHANGED',
      description: `Transitioned engagement lifecycle state from ${currentState} to ${newState}.`,
    });

    return { success: true, message: `Successfully transitioned to ${newState}.`, state: newState };
  }

  async updateFindingRemediation(
    findingId: string,
    remediationStatus: RemediationStatus,
    resolutionNotes?: string,
    assignedUser?: string,
    dueDate?: string
  ): Promise<Finding | null> {
    await this.delay(200);
    const updated = await findingService.updateFinding(findingId, {
      remediationStatus,
      resolutionNotes,
      assignedUser,
      dueDate,
      status: remediationStatus === 'FIXED' || remediationStatus === 'VERIFIED' ? 'RESOLVED' : 'REMEDIATION',
    });

    if (updated) {
      await this.logActivity({
        projectId: updated.projectId,
        entityType: 'FINDING',
        entityId: findingId,
        action: 'FINDING_UPDATED',
        description: `Updated remediation lifecycle of ${findingId} to ${remediationStatus}.`,
      });
    }
    return updated;
  }

  async updateEvidenceVerification(
    findingId: string,
    evidenceId: string,
    verificationStatus: EvidenceVerificationStatus,
    verifiedBy: string = 'Alex Vance'
  ): Promise<void> {
    await this.delay(200);
    const finding = await findingService.getFindingById(findingId);
    if (!finding) return;

    const evidenceList = await findingService.getFindingEvidence(findingId);
    const target = evidenceList.find((e) => e.id === evidenceId);
    if (target) {
      target.verificationStatus = verificationStatus;
      target.verifiedBy = verifiedBy;
      target.verifiedAt = new Date().toISOString();
      // Persist evidence updates
      const allEvidence = findingService['loadEvidence'] ? findingService['loadEvidence']() : [];
      const idx = allEvidence.findIndex((e: any) => e.id === evidenceId);
      if (idx !== -1) {
        allEvidence[idx] = target;
        findingService['saveEvidence'](allEvidence);
      }

      await this.logActivity({
        projectId: finding.projectId,
        entityType: 'EVIDENCE',
        entityId: evidenceId,
        action: 'EVIDENCE_VERIFIED',
        description: `Verified PoC evidence artifact for ${finding.id} as ${verificationStatus}.`,
      });
    }
  }

  async getWorkspaceOverview(projectId: string): Promise<WorkspaceOverview> {
    await this.delay(300);
    const project = await projectService.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    const [scopeAssets, findings, reports, allActivities] = await Promise.all([
      projectService.getScopeAssets(projectId),
      findingService.getFindingsByProjectId(projectId),
      reportService.getReports({ projectId }),
      this.loadActivities(),
    ]);

    const engagementState = await this.getEngagementState(projectId);
    const inScope = scopeAssets.filter((a) => a.scopeStatus === 'IN_SCOPE');
    const outOfScope = scopeAssets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

    // 1. Calculate Finding Stats
    const critical = findings.filter((f) => f.severity === 'CRITICAL').length;
    const high = findings.filter((f) => f.severity === 'HIGH').length;
    const medium = findings.filter((f) => f.severity === 'MEDIUM').length;
    const low = findings.filter((f) => f.severity === 'LOW' || f.severity === 'INFORMATIONAL').length;
    const fixedCount = findings.filter((f) => f.remediationStatus === 'FIXED').length;
    const verifiedCount = findings.filter((f) => f.remediationStatus === 'VERIFIED' || f.status === 'RESOLVED').length;
    const inProgressCount = findings.filter((f) => f.remediationStatus === 'IN_PROGRESS' || f.status === 'REMEDIATION').length;
    const openCount = findings.filter((f) => f.status === 'OPEN' && !f.remediationStatus).length;

    const findingStats: FindingStatsSummary = {
      total: findings.length,
      critical,
      high,
      medium,
      low,
      openCount,
      inProgressCount,
      fixedCount,
      verifiedCount,
    };

    // 2. Evidence Stats
    let totalEvidence = 0;
    let unreviewedEvidence = 0;
    let verifiedEvidence = 0;
    let rejectedEvidence = 0;

    for (const f of findings) {
      const evi = await findingService.getFindingEvidence(f.id);
      totalEvidence += evi.length;
      evi.forEach((e) => {
        if (e.verificationStatus === 'VERIFIED') verifiedEvidence++;
        else if (e.verificationStatus === 'REJECTED') rejectedEvidence++;
        else unreviewedEvidence++;
      });
    }

    const evidenceStats: EvidenceStatsSummary = {
      total: totalEvidence,
      unreviewedCount: unreviewedEvidence,
      verifiedCount: verifiedEvidence,
      rejectedCount: rejectedEvidence,
    };

    // 3. Deterministic Progress (0-100%)
    let progressScore = 0;
    if (project.name && project.organization) progressScore += 10; // Project setup
    if (inScope.length > 0) progressScore += 15; // Scope defined
    if (findings.length > 0) progressScore += 20; // Findings recorded
    if (totalEvidence > 0 && unreviewedEvidence === 0) progressScore += 15; // Evidence verified
    else if (totalEvidence > 0) progressScore += 8;
    if (findings.every((f) => f.riskScore > 0)) progressScore += 15; // Risk assessments done
    if (verifiedCount > 0 || fixedCount > 0) progressScore += 15; // Remediation active
    if (reports.length > 0) progressScore += 10; // Deliverables compiled
    const progress = Math.min(100, Math.max(10, progressScore));

    // 4. 5-Dimension Health Evaluation
    const scopeHealth: HealthStatus = inScope.length > 0 ? (outOfScope.length > 0 ? 'GOOD' : 'ATTENTION') : 'BLOCKED';
    const findingHealth: HealthStatus = critical > 0 && verifiedCount === 0 ? 'BLOCKED' : (high > 0 ? 'ATTENTION' : 'GOOD');
    const riskHealth: HealthStatus = findings.every((f) => f.riskScore > 0) ? 'GOOD' : 'ATTENTION';
    const evidenceHealth: HealthStatus = totalEvidence === 0 ? 'ATTENTION' : (unreviewedEvidence > 0 ? 'ATTENTION' : 'GOOD');
    const reportingHealth: HealthStatus = reports.length > 0 ? 'GOOD' : (engagementState === 'REPORTING' ? 'BLOCKED' : 'ATTENTION');

    const overallHealth: HealthStatus =
      scopeHealth === 'BLOCKED' || findingHealth === 'BLOCKED'
        ? 'BLOCKED'
        : scopeHealth === 'ATTENTION' || findingHealth === 'ATTENTION' || riskHealth === 'ATTENTION'
        ? 'ATTENTION'
        : 'GOOD';

    const health: EngagementHealth = {
      overall: overallHealth,
      scopeHealth,
      findingHealth,
      riskHealth,
      evidenceHealth,
      reportingHealth,
      details: {
        scopeMessage: inScope.length > 0 ? `${inScope.length} authorized target boundaries active.` : 'No authorized in-scope assets defined.',
        findingMessage: critical > 0 ? `${critical} unresolved Critical threat vector active.` : `${findings.length} vulnerabilities tracked.`,
        riskMessage: findings.every((f) => f.riskScore > 0) ? 'All findings evaluated by deterministic risk engine.' : 'Pending risk score calibrations.',
        evidenceMessage: unreviewedEvidence > 0 ? `${unreviewedEvidence} PoC traces pending tester verification.` : 'PoC evidence artifacts validated.',
        reportingMessage: reports.length > 0 ? `${reports.length} security assessment deliverables ready.` : 'Deliverable not yet generated.',
      },
    };

    // 5. Automated Checklist
    const checklist: AssessmentChecklist = {
      planning: [
        { id: 'chk-1', title: 'Engagement metadata & schedule initialized', completed: true },
        { id: 'chk-2', title: 'Client organization details & lead tester assigned', completed: !!project.leadTester },
      ],
      scope: [
        { id: 'chk-3', title: 'Authorized in-scope target assets specified', completed: inScope.length > 0, actionUrl: `/projects/${projectId}` },
        { id: 'chk-4', title: 'Out-of-scope restriction boundaries recorded', completed: outOfScope.length > 0, actionUrl: `/projects/${projectId}` },
      ],
      assessment: [
        { id: 'chk-5', title: 'Vulnerabilities discovered & recorded', completed: findings.length > 0, actionUrl: `/findings?projectId=${projectId}` },
        { id: 'chk-6', title: 'Proof-of-concept verification traces attached', completed: totalEvidence > 0, actionUrl: `/findings?projectId=${projectId}` },
      ],
      analysis: [
        { id: 'chk-7', title: 'Deterministic 4-factor risk scores computed', completed: findings.length > 0 && findings.every((f) => f.riskScore > 0), actionUrl: `/risk-analysis` },
        { id: 'chk-8', title: 'High-risk findings reviewed & prioritized', completed: critical === 0 || findings.some((f) => f.priority.startsWith('P1')), actionUrl: `/risk-analysis` },
      ],
      reporting: [
        { id: 'chk-9', title: 'Executive security report generated', completed: reports.length > 0, actionUrl: `/reports/new?projectId=${projectId}` },
        { id: 'chk-10', title: 'Formal deliverable review & sign-off', completed: reports.some((r) => r.status === 'READY'), actionUrl: `/reports` },
      ],
    };

    // 6. AI Recommended Next Action
    let recommendedAction: RecommendedAction = {
      id: 'REC-DEFAULT',
      title: 'Review Engagement Posture with AI Co-Pilot',
      reason: 'All current milestone checklists are satisfactory. Perform comprehensive posture review.',
      relatedEntityType: 'project',
      relatedEntityId: projectId,
      actionUrl: `/assistant?projectId=${projectId}&contextType=project`,
      actionLabel: 'Launch Co-Pilot Review',
      urgency: 'LOW',
    };

    if (inScope.length === 0) {
      recommendedAction = {
        id: 'REC-SCOPE',
        title: 'Define Authorized In-Scope Target Assets',
        reason: 'Testing boundary is unconfigured. Target assets must be defined before logging findings.',
        relatedEntityType: 'scope',
        relatedEntityId: projectId,
        actionUrl: `/projects/${projectId}`,
        actionLabel: 'Configure Scope Inventory',
        urgency: 'CRITICAL',
      };
    } else if (findings.length === 0) {
      recommendedAction = {
        id: 'REC-FINDING',
        title: 'Record First Security Finding',
        reason: 'Engagement is in active assessment. Log observed vulnerabilities with reproduction parameters.',
        relatedEntityType: 'finding',
        relatedEntityId: projectId,
        actionUrl: `/findings/new?projectId=${projectId}`,
        actionLabel: 'Add New Finding',
        urgency: 'HIGH',
      };
    } else if (critical > 0 && verifiedCount === 0) {
      const critFinding = findings.find((f) => f.severity === 'CRITICAL');
      recommendedAction = {
        id: 'REC-CRIT-FIX',
        title: `Triage Critical Threat Vector [${critFinding?.id || 'P1'}]`,
        reason: 'A Critical severity finding exposes customer data. Prioritize immediate developer mitigation.',
        relatedEntityType: 'finding',
        relatedEntityId: critFinding?.id,
        actionUrl: `/findings/${critFinding?.id || ''}`,
        actionLabel: 'Inspect Critical Finding',
        urgency: 'CRITICAL',
      };
    } else if (reports.length === 0) {
      recommendedAction = {
        id: 'REC-REPORT',
        title: 'Compile Security Assessment Deliverable',
        reason: 'Findings and risk assessments are ready. Generate the executive audit deliverable.',
        relatedEntityType: 'report',
        relatedEntityId: projectId,
        actionUrl: `/reports/new?projectId=${projectId}`,
        actionLabel: 'Generate Assessment Report',
        urgency: 'MEDIUM',
      };
    }

    const projectActivities = allActivities.filter((a) => a.projectId === projectId);

    return {
      project,
      progress,
      engagementState,
      health,
      checklist,
      recommendedAction,
      findingStats,
      evidenceStats,
      recentActivities: projectActivities.slice(0, 10),
    };
  }
}

export const workspaceService = new WorkspaceService();
