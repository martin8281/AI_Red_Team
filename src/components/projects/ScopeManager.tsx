import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  ShieldX, 
  Globe, 
  Terminal, 
  Link2, 
  Smartphone, 
  Layers, 
  Copy, 
  Check,
  Info
} from 'lucide-react';
import { ScopeAsset, ScopeStatus, AssetType } from '../../types/project.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AddAssetModal } from './AddAssetModal';

interface ScopeManagerProps {
  projectId: string;
  assets: ScopeAsset[];
  onAddAsset: (assetData: Omit<ScopeAsset, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateAsset: (id: string, updates: Partial<ScopeAsset>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
}

export const ScopeManager: React.FC<ScopeManagerProps> = ({
  projectId,
  assets,
  onAddAsset,
  onUpdateAsset,
  onDeleteAsset,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScopeStatus, setModalScopeStatus] = useState<ScopeStatus>('IN_SCOPE');
  const [editingAsset, setEditingAsset] = useState<ScopeAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inScopeAssets = assets.filter((a) => a.scopeStatus === 'IN_SCOPE');
  const outOfScopeAssets = assets.filter((a) => a.scopeStatus === 'OUT_OF_SCOPE');

  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'Domain':
        return <Globe className="w-3.5 h-3.5 text-brand-primary" />;
      case 'IP Address':
        return <Terminal className="w-3.5 h-3.5 text-brand-hover" />;
      case 'URL':
        return <Link2 className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'Application':
        return <Smartphone className="w-3.5 h-3.5 text-[#22C55E]" />;
      case 'API':
        return <Layers className="w-3.5 h-3.5 text-[#F97316]" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openAddModal = (status: ScopeStatus) => {
    setEditingAsset(null);
    setModalScopeStatus(status);
    setModalOpen(true);
  };

  const openEditModal = (asset: ScopeAsset) => {
    setEditingAsset(asset);
    setModalScopeStatus(asset.scopeStatus);
    setModalOpen(true);
  };

  const handleSaveModal = async (data: Omit<ScopeAsset, 'id' | 'createdAt'>) => {
    if (editingAsset) {
      await onUpdateAsset(editingAsset.id, data);
    } else {
      await onAddAsset(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Overview Card */}
      <Card variant="default" className="p-5 bg-bg-card border-border-dark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm" dot>
              Engagement Rules of Engagement
            </Badge>
            <span className="text-xs text-text-muted font-mono">
              {assets.length} Total Registered Target Assets
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed max-w-2xl">
            Strictly defined authorization boundary. Findings logged by testers will be verified against these targets.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => openAddModal('IN_SCOPE')}
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add In-Scope Asset
          </Button>
          <Button
            onClick={() => openAddModal('OUT_OF_SCOPE')}
            variant="outline"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Out-of-Scope
          </Button>
        </div>
      </Card>

      {/* Two Column In-Scope & Out-of-Scope Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* In-Scope Assets Card */}
        <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-border-dark">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-text-primary">
                  In-Scope Assets
                </h3>
                <span className="text-[10px] text-[#22C55E] font-mono uppercase tracking-wider">
                  Authorized Testing Targets ({inScopeAssets.length})
                </span>
              </div>
            </div>
            <button
              onClick={() => openAddModal('IN_SCOPE')}
              className="inline-flex items-center gap-1 text-xs text-brand-hover hover:text-white px-2.5 py-1 rounded-md bg-bg-elevated hover:bg-brand-primary/20 border border-border-dark hover:border-brand-primary/40 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Asset</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {inScopeAssets.length > 0 ? (
              inScopeAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-bg-elevated border border-border-dark hover:border-brand-primary/40 transition-all group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary">
                        {getAssetTypeIcon(asset.assetType)}
                        <span>{asset.assetType}</span>
                      </span>
                      <Badge variant="low" size="sm">IN_SCOPE</Badge>
                      <span className="text-[10px] font-mono text-text-muted">{asset.id}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <code className="text-xs font-mono font-bold text-text-primary break-all bg-bg-surface px-1.5 py-0.5 rounded border border-border-dark">
                        {asset.value}
                      </code>
                      <button
                        onClick={() => handleCopy(asset.value, asset.id)}
                        className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-surface transition-colors shrink-0"
                        title="Copy asset value"
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-3 h-3 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {asset.description && (
                      <p className="text-[11px] text-text-muted pt-0.5">
                        {asset.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-1 rounded-md text-text-muted hover:text-brand-hover hover:bg-bg-surface transition-colors"
                      title="Edit asset"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1 rounded-md text-text-muted hover:text-[#EF4444] hover:bg-bg-surface transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-text-muted bg-bg-surface rounded-xl border border-dashed border-border-dark space-y-2">
                <Info className="w-5 h-5 mx-auto text-text-muted" />
                <p>No in-scope assets defined yet.</p>
                <Button
                  onClick={() => openAddModal('IN_SCOPE')}
                  variant="outline"
                  size="sm"
                >
                  Add First In-Scope Target
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Out-of-Scope Assets Card */}
        <Card variant="default" className="p-6 bg-bg-card border-border-dark space-y-4 shadow-card-dark">
          <div className="flex items-center justify-between pb-3 border-b border-border-dark">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444]">
                <ShieldX className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-text-primary">
                  Out-of-Scope Assets
                </h3>
                <span className="text-[10px] text-[#EF4444] font-mono uppercase tracking-wider">
                  Excluded / Off-Limits Targets ({outOfScopeAssets.length})
                </span>
              </div>
            </div>
            <button
              onClick={() => openAddModal('OUT_OF_SCOPE')}
              className="inline-flex items-center gap-1 text-xs text-[#EF4444] hover:text-white px-2.5 py-1 rounded-md bg-bg-elevated hover:bg-[#EF4444]/20 border border-border-dark hover:border-[#EF4444]/40 transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>Add Excluded</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {outOfScopeAssets.length > 0 ? (
              outOfScopeAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-bg-elevated border border-border-dark hover:border-[#EF4444]/40 transition-all group flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-primary">
                        {getAssetTypeIcon(asset.assetType)}
                        <span>{asset.assetType}</span>
                      </span>
                      <Badge variant="critical" size="sm">OUT_OF_SCOPE</Badge>
                      <span className="text-[10px] font-mono text-text-muted">{asset.id}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-0.5">
                      <code className="text-xs font-mono font-bold text-text-secondary line-through decoration-[#EF4444] break-all bg-bg-surface px-1.5 py-0.5 rounded border border-border-dark">
                        {asset.value}
                      </code>
                      <button
                        onClick={() => handleCopy(asset.value, asset.id)}
                        className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-surface transition-colors shrink-0"
                        title="Copy asset value"
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-3 h-3 text-[#22C55E]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {asset.description && (
                      <p className="text-[11px] text-text-muted pt-0.5">
                        {asset.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-1 rounded-md text-text-muted hover:text-brand-hover hover:bg-bg-surface transition-colors"
                      title="Edit asset"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1 rounded-md text-text-muted hover:text-[#EF4444] hover:bg-bg-surface transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-text-muted bg-bg-surface rounded-xl border border-dashed border-border-dark space-y-2">
                <Info className="w-5 h-5 mx-auto text-text-muted" />
                <p>No excluded out-of-scope assets logged.</p>
                <Button
                  onClick={() => openAddModal('OUT_OF_SCOPE')}
                  variant="outline"
                  size="sm"
                >
                  Add Excluded Boundary
                </Button>
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Modal Dialog */}
      <AddAssetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
        projectId={projectId}
        initialScopeStatus={modalScopeStatus}
        editingAsset={editingAsset}
      />
    </div>
  );
};
