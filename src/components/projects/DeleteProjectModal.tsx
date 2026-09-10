import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { projectService } from '../../services/projectService';
import { Button } from '../ui/Button';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectDeleted: (projectId: string) => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const success = await projectService.deleteProject(project.id);
      if (success) {
        onProjectDeleted(project.id);
        onClose();
      } else {
        setError('Failed to delete project. Please refresh and try again.');
      }
    } catch {
      setError('An unexpected error occurred while deleting the project.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-bg-card border border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Delete Project Engagement
              </h3>
              <p className="text-xs text-text-muted font-mono">
                {project.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 text-xs text-[#EF4444]">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#EF4444]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Warning: Irreversible Action</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              You are about to delete <strong className="text-text-primary">{project.name}</strong> ({project.organization}).
            </p>
          </div>

          <div className="text-xs text-text-muted space-y-1 bg-bg-surface p-3 rounded-xl border border-border-dark font-mono">
            <div className="flex justify-between">
              <span>Target Scope:</span>
              <span className="text-text-secondary">{project.projectType}</span>
            </div>
            <div className="flex justify-between">
              <span>Recorded Findings:</span>
              <span className="text-text-secondary">{project.findingCount} finding(s)</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-text-secondary">{project.status}</span>
            </div>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Deleting this container will remove its local engagement configuration and scope boundaries.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border-dark bg-bg-surface/30 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={handleDelete}
            disabled={isDeleting}
            icon={isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </Button>
        </div>
      </div>
    </div>
  );
};
