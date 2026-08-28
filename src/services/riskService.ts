import { 
  RiskAssessment, 
  RiskHistory, 
  RiskFactors, 
  ProjectRiskSummary,
  AIRecommendationBundle 
} from '../types/risk.types';
import { Priority } from '../types/finding.types';
import { RiskEngine } from './riskEngine';
import { initialMockRiskAssessments, initialMockRiskHistory } from '../data/mockRiskAssessments';
import { findingService } from './findingService';
import { projectService } from './projectService';

const STORAGE_KEY_ASSESSMENTS = 'art_risk_assessments';
const STORAGE_KEY_HISTORY = 'art_risk_history';

class RiskService {
  private delay(ms = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private loadAssessments(): RiskAssessment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ASSESSMENTS);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockRiskAssessments;
  }

  private saveAssessments(items: RiskAssessment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ASSESSMENTS, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  private loadHistory(): RiskHistory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return initialMockRiskHistory;
  }

  private saveHistory(items: RiskHistory[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  async getAssessmentByFindingId(findingId: string): Promise<RiskAssessment | null> {
    await this.delay(150);
    const list = this.loadAssessments();
    let found = list.find((a) => a.findingId === findingId);
    if (!found) {
      // Create a default assessment from the finding if missing
      const finding = await findingService.getFindingById(findingId);
      if (finding) {
        const factors: RiskFactors = {
          impact: finding.severity === 'CRITICAL' ? 5 : finding.severity === 'HIGH' ? 4 : finding.severity === 'MEDIUM' ? 3 : 2,
          likelihood: finding.severity === 'CRITICAL' ? 4 : finding.severity === 'HIGH' ? 4 : 3,
          assetCriticality: 4,
          exploitability: 4,
        };
        const evaluated = RiskEngine.evaluate(factors);
        found = {
          id: `RA-${Date.now().toString().slice(-4)}`,
          findingId,
          ...factors,
          riskScore: evaluated.score,
          riskLevel: evaluated.level,
          recommendedPriority: evaluated.recommendedPriority,
          finalPriority: finding.priority || evaluated.recommendedPriority,
          assessedBy: finding.createdBy || 'Alex Vance',
          createdAt: finding.createdAt,
          updatedAt: finding.updatedAt,
        };
        list.push(found);
        this.saveAssessments(list);
      }
    }
    return found || null;
  }

  async getAllAssessments(): Promise<RiskAssessment[]> {
    await this.delay(150);
    return this.loadAssessments();
  }

  async updateAssessment(
    findingId: string,
    factors: RiskFactors,
    finalPriority?: Priority,
    reason?: string,
    changedBy: string = 'Alex Vance'
  ): Promise<RiskAssessment> {
    await this.delay(300);
    const list = this.loadAssessments();
    const evaluated = RiskEngine.evaluate(factors);
    const now = new Date().toISOString();

    const existingIdx = list.findIndex((a) => a.findingId === findingId);
    let previousScore = 75;

    if (existingIdx !== -1) {
      previousScore = list[existingIdx].riskScore;
      list[existingIdx] = {
        ...list[existingIdx],
        ...factors,
        riskScore: evaluated.score,
        riskLevel: evaluated.level,
        recommendedPriority: evaluated.recommendedPriority,
        finalPriority: finalPriority || list[existingIdx].finalPriority || evaluated.recommendedPriority,
        assessedBy: changedBy,
        updatedAt: now,
      };
    } else {
      const newAssessment: RiskAssessment = {
        id: `RA-${Date.now().toString().slice(-4)}`,
        findingId,
        ...factors,
        riskScore: evaluated.score,
        riskLevel: evaluated.level,
        recommendedPriority: evaluated.recommendedPriority,
        finalPriority: finalPriority || evaluated.recommendedPriority,
        assessedBy: changedBy,
        createdAt: now,
        updatedAt: now,
      };
      list.push(newAssessment);
    }

    this.saveAssessments(list);

    // Sync finding's score and priority
    await findingService.updateFinding(findingId, {
      riskScore: evaluated.score,
      priority: finalPriority || evaluated.recommendedPriority,
    });

    // Record change history
    if (reason || previousScore !== evaluated.score) {
      const history = this.loadHistory();
      history.unshift({
        id: `RH-${Date.now().toString().slice(-4)}`,
        riskAssessmentId: list[existingIdx !== -1 ? existingIdx : list.length - 1].id,
        findingId,
        previousScore,
        newScore: evaluated.score,
        reason: reason || 'Tester calibrated risk factor ratings.',
        changedBy,
        createdAt: now,
      });
      this.saveHistory(history);
    }

    return list.find((a) => a.findingId === findingId)!;
  }

  async getHistoryByFindingId(findingId: string): Promise<RiskHistory[]> {
    await this.delay(100);
    const all = this.loadHistory();
    return all.filter((h) => h.findingId === findingId);
  }

  async getProjectRiskSummary(projectId: string): Promise<ProjectRiskSummary> {
    await this.delay(200);
    const project = await projectService.getProjectById(projectId);
    const findings = await findingService.getFindingsByProjectId(projectId);
    const assessments = this.loadAssessments();

    let totalScore = 0;
    let highestFindingTitle = 'No active vulnerabilities';
    let highestFindingScore = 0;

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    findings.forEach((f) => {
      const ass = assessments.find((a) => a.findingId === f.id);
      const score = ass ? ass.riskScore : f.riskScore;
      totalScore += score;

      if (score > highestFindingScore) {
        highestFindingScore = score;
        highestFindingTitle = f.title;
      }

      if (f.severity === 'CRITICAL') criticalCount++;
      else if (f.severity === 'HIGH') highCount++;
      else if (f.severity === 'MEDIUM') mediumCount++;
      else lowCount++;
    });

    // Calculate project overall risk score (weighted formula favoring highest risk items)
    const avgScore = findings.length > 0 ? Math.round(totalScore / findings.length) : 0;
    // Composite: 60% highest finding + 40% average
    const overallScore = findings.length > 0 
      ? Math.min(100, Math.round(highestFindingScore * 0.6 + avgScore * 0.4))
      : 0;

    const riskLevel = RiskEngine.getRiskLevel(overallScore);

    return {
      projectId,
      projectName: project ? project.name : 'Unknown Engagement',
      overallScore,
      riskLevel,
      highestFindingTitle,
      highestFindingScore,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      totalFindings: findings.length,
    };
  }

  async generateAIRecommendations(findingId: string): Promise<AIRecommendationBundle> {
    await this.delay(600);
    const finding = await findingService.getFindingById(findingId);
    const assessment = await this.getAssessmentByFindingId(findingId);

    const title = finding?.title || 'Security Vulnerability';
    const score = assessment?.riskScore || finding?.riskScore || 75;
    const level = assessment?.riskLevel || 'HIGH';
    const priority = assessment?.finalPriority || finding?.priority || 'P1 — Immediate';

    return {
      technicalRecommendation: `1. Implement strict server-side schema verification on the target endpoint.\n2. Bind parameters using secure ORM / prepared statement constructs to decouple untrusted data from execution contexts.\n3. Enforce context-aware response headers (CSP, X-Frame-Options, HSTS).`,
      businessImpact: `Exploitation of this vector allows an unauthenticated adversary to traverse tenant boundaries, extract customer credentials, and disrupt critical financial workflows. Aggregate risk score evaluated at ${score}/100 (${level}).`,
      validationRecommendation: `Deploy fix to staging and re-verify with non-destructive differential testing. Verify that supplying unexpected parameter boundaries produces deterministic HTTP 400 Bad Request responses without disclosing internal framework stack traces.`,
      priorityReasoning: `Calibrated as ${priority} due to high exploitability rating (${assessment?.exploitability || 4}/5) combined with critical asset exposure on ${finding?.asset || 'target origin'}. Immediate mitigation is advised within 24–48 hours.`,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const riskService = new RiskService();
