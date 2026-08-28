import React from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { TrendDataPoint } from '../../types/analytics.types';
import { Card } from '../ui/Card';

interface TrendChartsProps {
  data: TrendDataPoint[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      {/* 1. Finding Discovery & Remediation Velocity */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Finding Discovery & Remediation Velocity
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">30_DAY_TIMELINE</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="findingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="remediatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="findingsCount"
                name="Total Findings"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#findingsGrad)"
              />
              <Area
                type="monotone"
                dataKey="remediatedCount"
                name="Verified Remediations"
                stroke="#22C55E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#remediatedGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Portfolio Risk Score Evolution */}
      <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-bold text-text-primary">
              Portfolio Risk Score Evolution (0–100)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">RISK_ENGINE_EVOLUTION</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1220',
                  borderColor: '#1E293B',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="averageRisk"
                name="Average Risk Score"
                stroke="#F97316"
                strokeWidth={3}
                dot={{ fill: '#F97316', r: 4 }}
                activeDot={{ r: 6, fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
};
