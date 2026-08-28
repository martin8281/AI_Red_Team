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
import { PieChart as PieIcon } from 'lucide-react';
import { RiskDistributionItem } from '../../types/dashboard.types';
import { Card } from '../ui/Card';

interface RiskDistributionProps {
  data: RiskDistributionItem[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: RiskDistributionItem;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-bg-elevated border border-border-dark shadow-2xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-bold text-text-primary">{item.name} Severity</span>
        </div>
        <div className="text-text-muted">
          Count: <span className="font-mono font-semibold text-text-primary">{item.count} findings</span>
        </div>
        <div className="text-text-muted">
          Distribution: <span className="font-mono font-semibold text-text-primary">{item.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RiskDistribution: React.FC<RiskDistributionProps> = ({ data }) => {
  return (
    <Card
      variant="default"
      className="p-6 bg-bg-card border-border-dark flex flex-col justify-between h-full shadow-card-dark"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Risk Distribution
              </h3>
              <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                Severity Breakdown
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-text-muted">27 Total Findings</span>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-52 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#1E293B' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(21, 31, 50, 0.4)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Pill Tally */}
      <div className="pt-4 border-t border-border-dark/60 grid grid-cols-4 gap-2">
        {data.map((item) => (
          <div
            key={item.name}
            className="p-2 rounded-lg bg-bg-surface border border-border-dark text-center space-y-0.5"
          >
            <div className="text-[10px] font-mono font-bold" style={{ color: item.color }}>
              {item.name}
            </div>
            <div className="text-sm font-extrabold text-text-primary font-mono">
              {item.count}
            </div>
            <div className="text-[10px] text-text-muted">
              {item.percentage}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
