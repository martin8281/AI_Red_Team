import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Loader2, 
  Download, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import { 
  AnalyticsFilters, 
  AnalyticsOverview, 
  RiskHeatmapPlot, 
  TrendDataPoint, 
  ProjectBenchmark, 
  SecurityAlert, 
  AISecurityInsightBundle 
} from '../types/analytics.types';
import { Finding } from '../types/finding.types';
import { Project } from '../types/project.types';
import { analyticsService } from '../services/analyticsService';
import { projectService } from '../services/projectService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { AnalyticsOverviewCards } from '../components/analytics/AnalyticsOverviewCards';
import { AnalyticsFilterBar } from '../components/analytics/AnalyticsFilterBar';
import { RiskHeatmap } from '../components/analytics/RiskHeatmap';
import { TrendCharts } from '../components/analytics/TrendCharts';
import { RemediationMetricsCard } from '../components/analytics/RemediationMetricsCard';
import { TopRiskFindingsTable } from '../components/analytics/TopRiskFindingsTable';
import { ProjectComparisonTable } from '../components/analytics/ProjectComparisonTable';
import { AISecurityInsightsCard } from '../components/analytics/AISecurityInsightsCard';
import { SecurityAlertsFeed } from '../components/analytics/SecurityAlertsFeed';
import { Card } from '../components/ui/Card';

export const AnalyticsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    projectId: 'ALL',
    dateRange: '30d',
    severity: 'ALL',
    status: 'ALL',
    priority: 'ALL',
  });

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [heatmapData, setHeatmapData] = useState<RiskHeatmapPlot[]>([]);
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [topRisks, setTopRisks] = useState<Finding[]>([]);
  const [benchmarks, setBenchmarks] = useState<ProjectBenchmark[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [aiInsights, setAiInsights] = useState<AISecurityInsightBundle | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [
        projectsList,
        ovData,
        hmData,
        trData,
        topR,
        bmData,
        altData,
        aiData,
      ] = await Promise.all([
        projectService.getProjects(),
        analyticsService.getOverview(filters),
        analyticsService.getHeatmapData(filters),
        analyticsService.getTrendData(filters),
        analyticsService.getTopRiskFindings(filters),
        analyticsService.getProjectBenchmarks(),
        analyticsService.getSecurityAlerts(filters),
        analyticsService.getAISecurityInsights(filters),
      ]);

      setProjects(projectsList);
      setOverview(ovData);
      setHeatmapData(hmData);
      setTrendData(trData);
      setTopRisks(topR);
      setBenchmarks(bmData);
      setAlerts(altData);
      setAiInsights(aiData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const handleRegenerateAI = async () => {
    setIsAiLoading(true);
    try {
      const newAi = await analyticsService.getAISecurityInsights(filters);
      setAiInsights(newAi);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportCSV = async () => {
    const csvContent = await analyticsService.exportAnalyticsCSV(filters);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `security_analytics_${filters.projectId}_${filters.dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setFilters({
      projectId: 'ALL',
      dateRange: '30d',
      severity: 'ALL',
      status: 'ALL',
      priority: 'ALL',
    });
  };

  return (
    <DashboardLayout
      title="Security Analytics & Risk Monitoring"
      subtitle="Real-time aggregation of findings, 5x5 threat heatmaps, remediation velocity, and AI posture synthesis."
    >
      <div className="space-y-6">
        
        {/* Filter Controls Bar */}
        <AnalyticsFilterBar
          filters={filters}
          onFilterChange={setFilters}
          projects={projects}
          onExportCSV={handleExportCSV}
          onReset={handleResetFilters}
        />

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">
              Computing deterministic portfolio metrics & heatmaps...
            </span>
          </div>
        ) : overview ? (
          <div className="space-y-6">
            
            {/* 1. Overview KPI Cards */}
            <AnalyticsOverviewCards overview={overview} />

            {/* 2. Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (7 cols): Risk Heatmap, Trend Charts, Top Risks */}
              <div className="lg:col-span-7 space-y-6">
                <RiskHeatmap data={heatmapData} />
                <TrendCharts data={trendData} />
                <TopRiskFindingsTable findings={topRisks} />
              </div>

              {/* Right Column (5 cols): AI Insights, Remediation SLA, Alerts, Benchmarks */}
              <div className="lg:col-span-5 space-y-6">
                {aiInsights && (
                  <AISecurityInsightsCard
                    insights={aiInsights}
                    onRegenerate={handleRegenerateAI}
                    isLoading={isAiLoading}
                  />
                )}
                <RemediationMetricsCard overview={overview} />
                <SecurityAlertsFeed alerts={alerts} />
                <ProjectComparisonTable benchmarks={benchmarks} />
              </div>

            </div>

          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-bg-card border border-border-dark text-center space-y-3 shadow-card-dark max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto opacity-50" />
            <h4 className="text-sm font-bold text-text-primary">No Analytics Available</h4>
            <p className="text-xs text-text-muted">
              Adjust your filter parameters or add security findings to populate portfolio metrics.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
