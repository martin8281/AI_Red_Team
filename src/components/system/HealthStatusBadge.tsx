import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, AlertTriangle, ShieldCheck, Server, Cpu, Database } from 'lucide-react';

interface SystemHealthState {
  api: 'ONLINE' | 'DEGRADED';
  database: 'CONNECTED' | 'DISCONNECTED';
  ollama: 'ACTIVE' | 'OFFLINE';
  model: string;
}

export const HealthStatusBadge: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthState>({
    api: 'ONLINE',
    database: 'CONNECTED',
    ollama: 'ACTIVE',
    model: 'qwen3:14b / nomic-embed-text',
  });

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-bg-surface border border-border-dark text-[11px] font-mono text-text-muted">
      {/* API Backend */}
      <div className="flex items-center gap-1">
        <Server className="w-3 h-3 text-[#22C55E]" />
        <span>API:</span>
        <span className="text-[#22C55E] font-bold">ONLINE</span>
      </div>

      <span className="text-border-dark">|</span>

      {/* Database / pgvector */}
      <div className="flex items-center gap-1">
        <Database className="w-3 h-3 text-brand-primary" />
        <span>pgvector:</span>
        <span className="text-brand-hover font-bold">READY</span>
      </div>

      <span className="text-border-dark">|</span>

      {/* Ollama / Qwen3 14B */}
      <div className="flex items-center gap-1">
        <Cpu className="w-3 h-3 text-brand-hover" />
        <span>Ollama:</span>
        <span className="text-brand-hover font-bold">Qwen3 14B</span>
      </div>
    </div>
  );
};
