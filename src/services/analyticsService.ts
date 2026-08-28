import { 
  AnalyticsFilters, 
  AnalyticsOverview, 
  RiskHeatmapPlot, 
  HeatmapFindingItem, 
  TrendDataPoint, 
  ProjectBenchmark, 
  SecurityAlert, 
  AISecurityInsightBundle 
} from '../types/analytics.types';
import { Finding } from '../types/finding.types';
import { projectService } from './projectService';
import { findingService } from './findingService';
import { riskService } from './riskService';
import { workspaceService } from './workspaceService';

class AnalyticsService {
  private delay(ms = 200): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private filterFindings(findings: Finding[], filters: AnalyticsFilters): Finding[] {
    return findings.filter((f) => {
      if (filters.projectId !== 'ALL' && f.projectId !== filters.projectId) return false;
      if (filters.severity !== 'ALL' && f.severity !== filters.severity) return false;
      if (filters.status !== 'ALL' && f.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && !f.priority.includes(filters.priority)) return false;

      if (filters.dateRange !== 'ALL') {
        const created = new Date(f.createdAt).getTime();
        const now = Date.now();
        const days = filters.dateRange === '7d' ? 7 : filters.dateRange === '30d' ? 30 : 90;
        if (now - created > days * 24 * 60 * 60 * 1000) return false;
      }

      return true;
    });
  }

  async getOverview(filters: AnalyticsFilters): Promise<AnalyticsOverview> {
    await this.delay(150);
    const allFindings = await findingService.getFindings();
    const filtered = this.filterFindings(allFindings, filters);

    if (filtered.length === 0) {
      return {
        overallRiskScore: 0,
        averageRiskScore: 0,
        maxRiskScore: 0,
        totalFindings: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        openCount: 0,
        inProgressCount: 0,
        resolvedCount: 0,
        remediationRate: 0,
        averageRemediationDays: 0,
      };
    }

    const totalFindings = filtered.length;
    const criticalCount = filtered.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = filtered.filter((f) => f.severity === 'HIGH').length;
    const mediumCount = filtered.filter((f) => f.severity === 'MEDIUM').length;
    const lowCount = filtered.filter((f) => f.severity === 'LOW' || f.severity === 'INFORMATIONAL').length;

    const resolvedCount = filtered.filter((f) => f.status === 'RESOLVED' || f.remediationStatus === 'VERIFIED').length;
    const inProgressCount = filtered.filter((f) => f.status === 'REMEDIATION' || f.remediationStatus === 'IN_PROGRESS' || f.remediationStatus === 'FIXED').length;
    const openCount = filtered.filter((f) => f.status === 'OPEN' && !f.remediationStatus).length;

    const riskScores = filtered.map((f) => f.riskScore).filter((r) => r > 0);
    const averageRiskScore = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;
    const maxRiskScore = riskScores.length > 0 ? Math.max(...riskScores) : 0;

    // Overall portfolio risk incorporates max risk and volume weight
    const overallRiskScore = Math.min(100, Math.round(maxRiskScore * 0.6 + averageRiskScore * 0.4));
    const remediationRate = Math.round((resolvedCount / totalFindings) * 100);

    return {
      overallRiskScore,
      averageRiskScore,
      maxRiskScore,
      totalFindings,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      openCount,
      inProgressCount,
      resolvedCount,
      remediationRate,
      averageRemediationDays: 4.2,
    };
  }

  /**
   * 5x5 Impact vs Likelihood Matrix
   */
  async getHeatmapData(filters: AnalyticsFilters): Promise<RiskHeatmapPlot[]> {
    await this.delay(150);
    const allFindings = await findingService.getFindings();
    const filtered = this.filterFindings(allFindings, filters);

    // Build 5x5 grid (Impact 1-5, Likelihood 1-5)
    const plots: Record<string, RiskHeatmapPlot> = {};
    for (let imp = 1; imp <= 5; imp++) {
      for (let lik = 1; lik <= 5; lik++) {
        plots[`${imp}-${lik}`] = { impact: imp, likelihood: lik, findings: [] };
      }
    }

    // Map each finding to Impact and Likelihood based on its factors or severity
    filtered.forEach((f) => {
      let impact = 3;
      let likelihood = 3;

      if (f.severity === 'CRITICAL') {
        impact = 5;
        likelihood = 4;
      } else if (f.severity === 'HIGH') {
        impact = 4;
        likelihood = 4;
      } else if (f.severity === 'MEDIUM') {
        impact = 3;
        likelihood = 3;
      } else {
        impact = 2;
        likelihood = 2;
      }

      const key = `${impact}-${likelihood}`;
      plots[key].findings.push({
        id: f.id,
        title: f.title,
        riskScore: f.riskScore,
        severity: f.severity,
        priority: f.priority,
        asset: f.asset,
      });
    });

    return Object.values(plots);
  }

  /**
   * Chronological Trend Data
   */
  async getTrendData(filters: AnalyticsFilters): Promise<TrendDataPoint[]> {
    await this.delay(150);
    const points: TrendDataPoint[] = [
      { date: 'Aug 01', findingsCount: 1, averageRisk: 45, remediatedCount: 0 },
      { date: 'Aug 07', findingsCount: 2, averageRisk: 62, remediatedCount: 0 },
      { date: 'Aug 14', findingsCount: 3, averageRisk: 74, remediatedCount: 1 },
      { date: 'Aug 21', findingsCount: 4, averageRisk: 86, remediatedCount: 1 },
      { date: 'Aug 27', findingsCount: 4, averageRisk: 78, remediatedCount: 2 },
    ];
    return points;
  }

  async getTopRiskFindings(filters: AnalyticsFilters, limit = 5): Promise<Finding[]> {
    await this.delay(150);
    const allFindings = await findingService.getFindings();
    const filtered = this.filterFindings(allFindings, filters);
    return filtered
      .filter((f) => f.status !== 'RESOLVED')
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit);
  }

  async getProjectBenchmarks(): Promise<ProjectBenchmark[]> {
    await this.delay(150);
    const projects = await projectService.getProjects();
    const allFindings = await findingService.getFindings();

    return projects.map((p) => {
      const pFindings = allFindings.filter((f) => f.projectId === p.id);
      const critical = pFindings.filter((f) => f.severity === 'CRITICAL').length;
      const high = pFindings.filter((f) => f.severity === 'HIGH').length;
      const resolved = pFindings.filter((f) => f.status === 'RESOLVED' || f.remediationStatus === 'VERIFIED').length;
      const rate = pFindings.length > 0 ? Math.round((resolved / pFindings.length) * 100) : 0;

      return {
        projectId: p.id,
        projectName: p.name,
        organization: p.organization,
        overallRisk: p.riskScore || 72,
        totalFindings: pFindings.length,
        criticalCount: critical,
        highCount: high,
        remediationRate: rate,
        status: p.status,
      };
    });
  }

  async getSecurityAlerts(filters: AnalyticsFilters): Promise<SecurityAlert[]> {
    await this.delay(150);
    return [
      {
        id: 'ALT-01',
        type: 'CRITICAL_VULN',
        title: 'Critical Threat Vector Unresolved',
        description: 'Blind SQL Injection on /api/v1/auth/login exposes production database tables.',
        severity: 'CRITICAL',
        timestamp: '2026-08-27T09:18:00.000Z',
        targetUrl: '/findings/FND-201',
      },
      {
        id: 'ALT-02',
        type: 'EVIDENCE_VERIFIED',
        title: 'Proof-of-Concept Evidence Validated',
        description: 'Tester Alex Vance verified AWS IMDSv2 metadata SSRF reproduction trace.',
        severity: 'MEDIUM',
        timestamp: '2026-08-27T08:45:00.000Z',
        targetUrl: '/projects/PRJ-101/workspace',
      },
      {
        id: 'ALT-03',
        type: 'REMEDIATION_COMPLETE',
        title: 'XSS Sanitization Patch Verified in Staging',
        description: 'DOMPurify output encoding verified on comments endpoint.',
        severity: 'LOW',
        timestamp: '2026-08-26T16:20:00.000Z',
        targetUrl: '/findings/FND-202',
      },
    ];
  }

  async getAISecurityInsights(filters: AnalyticsFilters): Promise<AISecurityInsightBundle> {
    await this.delay(400);
    const overview = await this.getOverview(filters);

    return {
      postureSummary: `The current engagement portfolio reflects an overall risk score of **${overview.overallRiskScore}/100** across **${overview.totalFindings} vulnerabilities**. Threat exposure is concentrated in **${overview.criticalCount} Critical** and **${overview.highCount} High** severity findings.`,
      biggestConcern: `**FND-201 (Blind SQLi)** represents the highest threat exposure (92/100 risk score), allowing potential authentication bypass and database exfiltration without credential verification.`,
      priorityRemediation: `Enforce parameterized SQL prepared statements on authentication routes and restrict container metadata access to prevent SSRF credential harvesting.`,
      trendExplanation: `Risk velocity spiked from 45 to 86 in mid-August upon discovery of unparameterized database queries, and has stabilized at 78 following initial staging patches.`,
      remediationRateInsight: `Remediation rate stands at **${overview.remediationRate}%** with **${overview.resolvedCount} of ${overview.totalFindings} vulnerabilities verified**. Average fix-to-verification turnaround is **${overview.averageRemediationDays} days**.`,
      generatedAt: new Date().toISOString(),
    };
  }

  async exportAnalyticsCSV(filters: AnalyticsFilters): Promise<string> {
    const allFindings = await findingService.getFindings();
    const filtered = this.filterFindings(allFindings, filters);

    const headers = ['Finding ID', 'Project', 'Title', 'Severity', 'Risk Score', 'Priority', 'Status', 'Remediation Stage', 'Asset'];
    const rows = filtered.map((f) => [
      f.id,
      f.projectId,
      `"${f.title.replace(/"/g, '""')}"`,
      f.severity,
      f.riskScore,
      f.priority,
      f.status,
      f.remediationStatus || 'NOT_STARTED',
      f.asset,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const analyticsService = new AnalyticsService();
