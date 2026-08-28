import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Card } from '../ui/Card';
import { ShieldAlert, BarChart2 } from 'lucide-react';

interface RiskTrendsChartProps {
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  priorityCounts: {
    p1: number;
    p2: number;
    p3: number;
    p4: number;
  };
}

export const RiskTrendsChart: React.FC<RiskTrendsChartProps> = ({
  severityCounts,
  priorityCounts,
}) => {
  const severityData = [
    { name: 'Critical', count: severityCounts.critical, color: '#EF4444' },
    { name: 'High', count: severityCounts.high, color: '#F97316' },
    { name: 'Medium', count: severityCounts.medium, color: '#EAB308' },
    { name: 'Low', count: severityCounts.low, color: '#22C55E' },
  ];

  const priorityData = [
    { name: 'P1 Immediate', count: priorityCounts.p1, color: '#EF4444' },
    { name: 'P2 High', count: priorityCounts.p2, color: '#F97316' },
    { name: 'P3 Normal', count: priorityCounts.p3, color: '#EAB308' },
    { name: 'P4 Low', count: priorityCounts.p4, color: '#22C55E' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Severity Chart */}
      <Card variant="default" className="p-5 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center justify-between pb-2 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-brand-primary" />
            <h4 className="text-xs sm:text-sm font-bold text-text-primary">
              Threat Severity Distribution
            </h4>
          </div>
          <span className="text-[10px] font-mono text-text-muted">BY RISK LEVEL</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  borderColor: '#1E293B',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Priority Chart */}
      <Card variant="default" className="p-5 bg-bg-card border-border-dark space-y-3 shadow-card-dark">
        <div className="flex items-center justify-between pb-2 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-primary" />
            <h4 className="text-xs sm:text-sm font-bold text-text-primary">
              Remediation Priority Queue
            </h4>
          </div>
          <span className="text-[10px] font-mono text-text-muted">BY ACTION TIER</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  borderColor: '#1E293B',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
