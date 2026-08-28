import React, { useRef } from 'react';
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
import { 
  mockStatistics, 
  mockRiskScore, 
  mockRiskDistribution, 
  mockFindings, 
  mockProjects, 
  mockActivities 
} from '../data/mockDashboardData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface DashboardPageProps {
  moduleName?: string;
  moduleDescription?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  moduleName = 'Dashboard',
  moduleDescription = 'Overview of your security testing activity',
}) => {
  const findingsSectionRef = useRef<HTMLDivElement>(null);

  const scrollToFindings = () => {
    if (findingsSectionRef.current) {
      findingsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isMainDashboard = moduleName === 'Dashboard';

  if (!isMainDashboard) {
    // Dedicated view for other protected routes (/assistant, /projects, /findings, etc.)
    return (
      <DashboardLayout title={moduleName} subtitle={moduleDescription}>
        <div className="space-y-6">
          {/* Module Banner */}
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

          {/* Module Context Content */}
          {moduleName === 'Finding Management' && (
            <RecentFindings findings={mockFindings} />
          )}

          {moduleName === 'Projects' && (
            <RecentProjects projects={mockProjects} />
          )}

          {moduleName === 'AI Assistant' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AIAssistantCard onReviewFindings={scrollToFindings} />
              </div>
              <div className="lg:col-span-5">
                <RiskScoreCard data={mockRiskScore} />
              </div>
            </div>
          )}

          {moduleName === 'Risk Prioritization & Analysis' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <RiskScoreCard data={mockRiskScore} />
              </div>
              <div className="lg:col-span-6">
                <RiskDistribution data={mockRiskDistribution} />
              </div>
            </div>
          )}

          {moduleName !== 'Finding Management' && 
           moduleName !== 'Projects' && 
           moduleName !== 'AI Assistant' && 
           moduleName !== 'Risk Prioritization & Analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockStatistics.map((stat) => (
                  <StatCard key={stat.id} data={stat} />
                ))}
              </div>
              <RecentFindings findings={mockFindings} />
            </div>
          )}

          <QuickActions />
        </div>
      </DashboardLayout>
    );
  }

  // Main Dashboard View
  return (
    <DashboardLayout title="Dashboard" subtitle="Overview of your security testing activity">
      <div className="space-y-6">
        
        {/* Row 1: 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStatistics.map((stat) => (
            <StatCard key={stat.id} data={stat} />
          ))}
        </div>

        {/* Row 2: AI Assistant Highlight & Risk Score */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AIAssistantCard onReviewFindings={scrollToFindings} />
          </div>
          <div className="lg:col-span-5">
            <RiskScoreCard data={mockRiskScore} />
          </div>
        </div>

        {/* Row 3: Quick Actions */}
        <QuickActions />

        {/* Row 4: Recent Findings Table & Risk Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={findingsSectionRef}>
          <div className="lg:col-span-8">
            <RecentFindings findings={mockFindings} />
          </div>
          <div className="lg:col-span-4">
            <RiskDistribution data={mockRiskDistribution} />
          </div>
        </div>

        {/* Row 5: Recent Projects & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RecentProjects projects={mockProjects} />
          </div>
          <div className="lg:col-span-5">
            <ActivityFeed activities={mockActivities} />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
export default DashboardPage;
