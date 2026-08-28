import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Bell, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import { SecurityAlert } from '../../types/analytics.types';
import { Card } from '../ui/Card';

interface SecurityAlertsFeedProps {
  alerts: SecurityAlert[];
}

export const SecurityAlertsFeed: React.FC<SecurityAlertsFeedProps> = ({
  alerts,
}) => {
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30';
      case 'HIGH':
        return 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/30';
      case 'MEDIUM':
        return 'bg-[#EAB308]/10 text-[#EAB308] border-[#EAB308]/30';
      default:
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30';
    }
  };

  return (
    <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark text-left">
      <div className="flex items-center justify-between pb-3 border-b border-border-dark">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm sm:text-base font-bold text-text-primary">
            Active Security Operational Alerts
          </h3>
        </div>
        <span className="text-xs font-mono text-text-muted">
          {alerts.length} Active Events
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-3.5 rounded-xl bg-bg-surface border border-border-dark space-y-2 text-xs hover:border-brand-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${getSeverityBadge(
                      alt.severity
                    )}`}
                  >
                    {alt.severity}
                  </span>
                  <span className="font-bold text-text-primary">{alt.title}</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {alt.description}
                </p>
              </div>

              {alt.targetUrl && (
                <Link
                  to={alt.targetUrl}
                  className="p-1.5 rounded-lg bg-bg-elevated hover:bg-brand-primary text-text-muted hover:text-white border border-border-dark transition-colors shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="text-[10px] font-mono text-text-muted">
              Logged: {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
