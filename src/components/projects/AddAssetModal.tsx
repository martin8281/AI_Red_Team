import React, { useState, useEffect } from 'react';
import { X, Plus, Shield, Globe, Terminal, Link2, Smartphone, Layers, CheckCircle2 } from 'lucide-react';
import { ScopeAsset, AssetType, ScopeStatus } from '../../types/project.types';
import { Button } from '../ui/Button';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Omit<ScopeAsset, 'id' | 'createdAt'>) => Promise<void>;
  projectId: string;
  initialScopeStatus?: ScopeStatus;
  editingAsset?: ScopeAsset | null;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projectId,
  initialScopeStatus = 'IN_SCOPE',
  editingAsset = null,
}) => {
  const [assetType, setAssetType] = useState<AssetType>('Domain');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [scopeStatus, setScopeStatus] = useState<ScopeStatus>(initialScopeStatus);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAsset) {
      setAssetType(editingAsset.assetType);
      setValue(editingAsset.value);
      setDescription(editingAsset.description || '');
      setScopeStatus(editingAsset.scopeStatus);
    } else {
      setAssetType('Domain');
      setValue('');
      setDescription('');
      setScopeStatus(initialScopeStatus);
    }
    setError(null);
  }, [editingAsset, initialScopeStatus, isOpen]);

  if (!isOpen) return null;

  const assetTypes: AssetType[] = [
    'Domain',
    'IP Address',
    'URL',
    'Application',
    'API',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Asset target value (domain, IP, URL, or API endpoint) is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        projectId,
        assetType,
        value: value.trim(),
        description: description.trim() || undefined,
        scopeStatus,
      });
      onClose();
    } catch {
      setError('Failed to save scope asset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-bg-card border border-border-dark p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-dark">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-primary" />
            <h3 className="text-base font-bold text-text-primary">
              {editingAsset ? 'Edit Scope Asset' : 'Add Target Scope Asset'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-elevated"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <p className="p-2.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Scope Status Toggle */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Scope Boundary Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScopeStatus('IN_SCOPE')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  scopeStatus === 'IN_SCOPE'
                    ? 'bg-brand-primary/15 text-brand-hover border-brand-primary/40'
                    : 'bg-bg-elevated text-text-muted border-border-dark hover:bg-bg-hover'
                }`}
              >
                In-Scope (Authorized Target)
              </button>
              <button
                type="button"
                onClick={() => setScopeStatus('OUT_OF_SCOPE')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  scopeStatus === 'OUT_OF_SCOPE'
                    ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                    : 'bg-bg-elevated text-text-muted border-border-dark hover:bg-bg-hover'
                }`}
              >
                Out-of-Scope (Excluded)
              </button>
            </div>
          </div>

          {/* Asset Type */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Asset Category Type
            </label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              {assetTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Value */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Target Value (Host, IP, URL, or Endpoint) <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                assetType === 'Domain'
                  ? 'e.g. portal.target.corp'
                  : assetType === 'IP Address'
                  ? 'e.g. 192.168.1.0/24'
                  : assetType === 'API'
                  ? 'e.g. https://api.target.corp/v1'
                  : 'e.g. https://app.target.corp/login'
              }
              className="w-full px-3.5 py-2.5 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm font-mono text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-text-secondary">
              Asset Notes / Scope Context
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Customer authentication proxy cluster"
              className="w-full px-3.5 py-2 rounded-lg bg-bg-elevated border border-border-dark text-xs sm:text-sm text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
          </div>

          {/* Safety Notice */}
          <div className="p-2.5 rounded-lg bg-bg-surface border border-border-dark text-[11px] text-text-muted">
            Assets defined in scope configure boundary context for findings correlation and reporting. No network traffic or automated scanning is executed.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingAsset ? 'Update Asset' : 'Add to Scope'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
