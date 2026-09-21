import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  DashboardLayout 
} from '../components/dashboard/DashboardLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { RiskScoreCard } from '../components/dashboard/RiskScoreCard';
import { AIAssistantCard } from '../components/dashboard/AIAssistantCard';
import { RiskDistribution } from '../components/dashboard/RiskDistribution';
import { RecentFindings } from '../components/dashboard/RecentFindings';
import { RecentProjects } from '../components/dashboard/RecentProjects';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { QuickActions } from '../components/dashboard/QuickActions';
import { projectService } from '../services/projectService';
import { findingService } from '../services/findingService';
import { projectFileService } from '../services/projectFileService';
import { Project as ServiceProject } from '../types/project.types';
import { Finding as ServiceFinding } from '../types/finding.types';
import { 
  StatCardData, 
  RiskScoreData, 
  RiskDistributionItem, 
  Finding as DashboardFinding, 
  Project as DashboardProject,
  ActivityItem
} from '../types/dashboard.types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

interface DashboardPageProps {
  moduleName?: string;
  moduleDescription?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  moduleName = 'Dashboard',
  moduleDescription = 'Overview of your security testing activity',
}) => {
  const findingsSectionRef = useRef<HTMLDivElement>(null);

  const [rawProjects, setRawProjects] = useState<ServiceProject[]>([]);
  const [rawFindings, setRawFindings] = useState<ServiceFinding[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [projectsData, findingsData] = await Promise.all([
        projectService.getProjects(),
        findingService.getFindings(),
      ]);

      setRawProjects(projectsData);
      setRawFindings(findingsData);

      // Aggregate dynamic activities
      const acts: ActivityItem[] = [];
      projectsData.slice(0, 4).forEach((p) => {
        acts.push({
          id: `act-p-${p.id}`,
          timestamp: p.updatedAt ? new Date(p.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          title: `Project ${p.name}`,
          description: `Status: ${p.status} · ${p.organization}`,
          type: 'project',
        });
      });

      findingsData.slice(0, 4).forEach((f) => {
        acts.push({
          id: `act-f-${f.id}`,
          timestamp: f.createdAt ? new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
          title: `Vulnerability: ${f.title}`,
          description: `${f.severity} severity on ${f.asset}`,
          type: 'finding',
          severity: f.severity === 'CRITICAL' ? 'Critical' : f.severity === 'HIGH' ? 'High' : 'Medium',
        });
      });

      setActivities(acts);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Event listeners for real-time live synchronization across tabs and modals
    const handleSync = () => {
      loadDashboardData();
    };

    window.addEventListener('project-created', handleSync);
    window.addEventListener('project-updated', handleSync);
    window.addEventListener('project-deleted', handleSync);
    window.addEventListener('project-file-added', handleSync);
    window.addEventListener('project-file-deleted', handleSync);
    window.addEventListener('finding-created', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('project-created', handleSync);
      window.removeEventListener('project-updated', handleSync);
      window.removeEventListener('project-deleted', handleSync);
      window.removeEventListener('project-file-added', handleSync);
      window.removeEventListener('project-file-deleted', handleSync);
      window.removeEventListener('finding-created', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  const scrollToFindings = () => {
    if (findingsSectionRef.current) {
      findingsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Convert Service Projects to Dashboard Projects
  const dashboardProjects: DashboardProject[] = useMemo(() => {
    return rawProjects.map((p) => {
      const pFindings = rawFindings.filter((f) => f.projectId === p.id);
      return {
        id: p.id,
        name: p.name,
        type: p.projectType,
        status: p.status === 'ACTIVE' ? 'Active' : p.status === 'COMPLETED' ? 'Completed' : 'In Progress',
        progress: p.progress || (p.status === 'ACTIVE' ? 45 : 0),
        findingsCount: {
          critical: pFindings.filter((f) => f.severity === 'CRITICAL').length,
          high: pFindings.filter((f) => f.severity === 'HIGH').length,
          medium: pFindings.filter((f) => f.severity === 'MEDIUM').length,
          low: pFindings.filter((f) => f.severity === 'LOW').length,
        },
        lastUpdated: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : 'Today',
        leadTester: p.leadTester || 'Alex Vance',
      };
    });
  }, [rawProjects, rawFindings]);

  // Convert Service Findings to Dashboard Findings
  const dashboardFindings: DashboardFinding[] = useMemo(() => {
    return rawFindings.map((f) => {
      const proj = rawProjects.find((p) => p.id === f.projectId);
      const sevMap: Record<string, 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'> = {
        CRITICAL: 'Critical',
        HIGH: 'High',
        MEDIUM: 'Medium',
        LOW: 'Low',
        INFORMATIONAL: 'Informational',
      };
      const statMap: Record<string, 'Open' | 'Reviewing' | 'Resolved'> = {
        OPEN: 'Open',
        IN_REVIEW: 'Reviewing',
        REMEDIATION: 'Reviewing',
        RESOLVED: 'Resolved',
        ACCEPTED_RISK: 'Resolved',
        REOPENED: 'Open',
      };
      return {
        id: f.id,
        title: f.title,
        project: proj ? proj.name : (f.projectName || 'Enterprise Banking Scope'),
        severity: sevMap[f.severity] || 'Medium',
        riskScore: f.riskScore || 75,
        status: statMap[f.status] || 'Open',
        cwe: f.vulnerabilityType === 'SQL Injection' ? 'CWE-89' : f.vulnerabilityType === 'Cross-Site Scripting' ? 'CWE-79' : 'CWE-287',
        target: f.asset || 'api.apexfin.com',
        description: f.description,
        aiAnalysis: f.impact,
        recommendation: f.recommendation,
        discoveredAt: f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Recently',
      };
    });
  }, [rawFindings, rawProjects]);

  // Dynamic Statistics
  const dynamicStatistics: StatCardData[] = useMemo(() => {
    const activeProjects = rawProjects.filter((p) => p.status === 'ACTIVE').length;
    const openFindings = rawFindings.filter((f) => f.status !== 'RESOLVED').length;
    const criticalFindings = rawFindings.filter((f) => f.severity === 'CRITICAL').length;
    const highFindings = rawFindings.filter((f) => f.severity === 'HIGH').length;

    return [
      {
        id: 'stat-active-projects',
        label: 'Active Engagements',
        value: activeProjects,
        change: '+12%',
        isPositive: true,
        trendText: `${rawProjects.length} Total Projects in Scope`,
        iconName: 'projects',
      },
      {
        id: 'stat-open-findings',
        label: 'Open Vulnerabilities',
        value: openFindings,
        change: `${rawFindings.length} Total`,
        isPositive: false,
        trendText: `${rawFindings.length} Cumulative Findings`,
        iconName: 'findings',
      },
      {
        id: 'stat-critical-findings',
        label: 'Critical Vulnerabilities',
        value: criticalFindings,
        change: 'Immediate Action',
        isPositive: false,
        trendText: 'Immediate Remediation Required',
        iconName: 'critical',
        accentColor: '#EF4444',
      },
      {
        id: 'stat-high-findings',
        label: 'High Risk Findings',
        value: highFindings,
        change: 'P1 Queue',
        isPositive: false,
        trendText: 'P1/P2 Escalation Queue',
        iconName: 'engagements',
        accentColor: '#F97316',
      },
    ];
  }, [rawProjects, rawFindings]);

  // Dynamic Risk Score Data
  const dynamicRiskScore: RiskScoreData = useMemo(() => {
    const critCount = rawFindings.filter((f) => f.severity === 'CRITICAL').length;
    const highCount = rawFindings.filter((f) => f.severity === 'HIGH').length;
    const medCount = rawFindings.filter((f) => f.severity === 'MEDIUM').length;
    const lowCount = rawFindings.filter((f) => f.severity === 'LOW').length;

    // Unified authoritative portfolio risk formula: 60% highest finding score + 40% average finding score
    const riskScores = rawFindings.map((f) => f.riskScore).filter((r) => r > 0);
    const averageScore = riskScores.length > 0 ? Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length) : 0;
    const maxScore = riskScores.length > 0 ? Math.max(...riskScores) : 0;
    const normalizedScore = riskScores.length > 0 
      ? Math.min(100, Math.round(maxScore * 0.6 + averageScore * 0.4)) 
      : 0;

    const status: RiskScoreData['status'] = 
      normalizedScore >= 75 ? 'CRITICAL' :
      normalizedScore >= 50 ? 'HIGH' :
      normalizedScore >= 30 ? 'MODERATE' : 'LOW';

    return {
      score: normalizedScore,
      maxScore: 100,
      status,
      statusText: `${critCount} Critical and ${highCount} High vulnerabilities impacting active scopes.`,
      changeFromLastMonth: 4,
      breakdown: [
        { label: 'Critical Assets', value: critCount * 25, color: '#EF4444' },
        { label: 'Authentication Endpoints', value: highCount * 18, color: '#F97316' },
        { label: 'API Parameter Handling', value: medCount * 10, color: '#EAB308' },
        { label: 'Network & Perimeter', value: lowCount * 5, color: '#22C55E' },
      ],
    };
  }, [rawFindings]);

  // Dynamic Severity Distribution
  const dynamicRiskDistribution: RiskDistributionItem[] = useMemo(() => {
    const total = rawFindings.length || 1;
    const crit = rawFindings.filter((f) => f.severity === 'CRITICAL').length;
    const high = rawFindings.filter((f) => f.severity === 'HIGH').length;
    const med = rawFindings.filter((f) => f.severity === 'MEDIUM').length;
    const low = rawFindings.filter((f) => f.severity === 'LOW').length;
    const info = rawFindings.filter((f) => f.severity === 'INFORMATIONAL').length;

    return [
      { name: 'Critical', count: crit, color: '#EF4444', percentage: Math.round((crit / total) * 100) },
      { name: 'High', count: high, color: '#F97316', percentage: Math.round((high / total) * 100) },
      { name: 'Medium', count: med, color: '#EAB308', percentage: Math.round((med / total) * 100) },
      { name: 'Low', count: low, color: '#22C55E', percentage: Math.round((low / total) * 100) },
      { name: 'Informational', count: info, color: '#3B82F6', percentage: Math.round((info / total) * 100) },
    ];
  }, [rawFindings]);

  const isMainDashboard = moduleName === 'Dashboard';

  if (!isMainDashboard) {
    return (
      <DashboardLayout title={moduleName} subtitle={moduleDescription}>
        <div className="space-y-6">
          <Card variant="default" className="p-6 bg-bg-card border-border-dark relative overflow-hidden shadow-card-dark">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-[#A78BFA] to-brand-secondary" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm" dot>
                    Active Module
                  </Badge>
                  <span className="text-xs font-mono text-text-muted">ENTERPRISE_SCOPE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary">
                  {moduleName} Workspace
                </h2>
                <p className="text-xs sm:text-sm text-text-muted">
                  {moduleDescription}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#22C55E] bg-bg-elevated px-3 py-1.5 rounded-lg border border-border-dark">
                <ShieldCheck className="w-4 h-4" />
                <span>Authorized Human-in-the-Loop</span>
              </div>
            </div>
          </Card>

          {moduleName === 'Finding Management' && (
            <RecentFindings findings={dashboardFindings} />
          )}

          {moduleName === 'Projects' && (
            <RecentProjects projects={dashboardProjects} />
          )}

          {moduleName === 'AI Assistant' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AIAssistantCard onReviewFindings={scrollToFindings} />
              </div>
              <div className="lg:col-span-5">
                <RiskScoreCard data={dynamicRiskScore} />
              </div>
            </div>
          )}

          {moduleName === 'Risk Prioritization & Analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <RiskScoreCard data={dynamicRiskScore} />
              </div>
              <div className="lg:col-span-6">
                <RiskDistribution data={dynamicRiskDistribution} />
              </div>
            </div>
          )}

          <QuickActions />
        </div>
      </DashboardLayout>
    );
  }

  // Main Dashboard View (100% Dynamic)
  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your security testing activity">
      <div className="space-y-6">
        
        {/* Row 1: Dynamic 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicStatistics.map((stat) => (
            <StatCard key={stat.id} data={stat} />
          ))}
        </div>

        {/* Row 2: AI Assistant Highlight & Live Risk Score */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AIAssistantCard onReviewFindings={scrollToFindings} />
          </div>
          <div className="lg:col-span-5">
            <RiskScoreCard data={dynamicRiskScore} />
          </div>
        </div>

        {/* Row 3: Quick Actions */}
        <QuickActions />

        {/* Row 4: Recent Findings Table & Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={findingsSectionRef}>
          <div className="lg:col-span-8">
            <RecentFindings findings={dashboardFindings} />
          </div>
          <div className="lg:col-span-4">
            <RiskDistribution data={dynamicRiskDistribution} />
          </div>
        </div>

        {/* Row 5: Recent Projects (Reflecting add/edit/delete) & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RecentProjects projects={dashboardProjects} />
          </div>
          <div className="lg:col-span-5">
            <ActivityFeed activities={activities} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
