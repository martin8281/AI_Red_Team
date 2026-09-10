import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderGit2, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Edit3,
  Trash2
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types/project.types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EditProjectModal } from './EditProjectModal';
import { DeleteProjectModal } from './DeleteProjectModal';

interface ProjectCardProps {
  project: Project;
  onProjectUpdated?: (updatedProject: Project) => void;
  onProjectDeleted?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onProjectUpdated, 
  onProjectDeleted 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="brand" size="sm" dot pulse>ACTIVE</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral" size="sm">DRAFT</Badge>;
      case 'ON HOLD':
        return <Badge variant="medium" size="sm" dot>ON HOLD</Badge>;
      case 'COMPLETED':
        return <Badge variant="low" size="sm">COMPLETED</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" size="sm">ARCHIVED</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  const hasCritical = project.criticalFindingCount > 0;

  return (
    <>
      <Card
        variant="default"
        hoverEffect
        className="p-5 sm:p-6 bg-bg-card border-border-dark flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-300 shadow-card-dark"
      >
        {/* Top ambient highlight */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brand-primary/0 to-transparent group-hover:via-brand-primary/70 transition-all duration-500" />

        <div className="space-y-4">
          {/* Header Strip */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-text-muted">{project.id}</span>
                <span className="text-[11px] text-text-secondary font-medium">· {project.organization}</span>
              </div>
              <h3 className="text-base font-bold text-text-primary group-hover:text-white transition-colors">
                {project.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusBadge(project.status)}
              
              {/* Card Action Controls: Edit & Delete */}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowEditModal(true);
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-brand-hover hover:bg-bg-elevated border border-transparent hover:border-border-dark transition-colors"
                  title="Edit Project Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteModal(true);
                  }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-text-muted leading-relaxed line-clamp-2 text-left">
            {project.description}
          </p>

          {/* Project Type Tag */}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <FolderGit2 className="w-3.5 h-3.5 text-brand-primary shrink-0" />
            <span className="font-medium truncate">{project.projectType}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted text-[11px]">Assessment Progress</span>
              <span className="font-mono font-bold text-text-primary">{project.progress}%</span>
            </div>
            <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  project.status === 'COMPLETED'
                    ? 'bg-[#22C55E]'
                    : 'bg-gradient-to-r from-brand-primary to-brand-secondary'
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Findings & Risk Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-bg-surface border border-border-dark text-center">
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase block">Findings</span>
              <span className="text-sm font-bold font-mono text-text-primary">{project.findingCount}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase block">Critical</span>
              <span className={`text-sm font-bold font-mono ${hasCritical ? 'text-[#EF4444]' : 'text-text-secondary'}`}>
                {project.criticalFindingCount}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-text-muted uppercase block">Risk Score</span>
              <span className={`text-sm font-bold font-mono ${
                project.riskScore >= 75 ? 'text-[#EF4444]' : project.riskScore >= 50 ? 'text-[#F97316]' : 'text-[#22C55E]'
              }`}>
                {project.riskScore}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Meta & Open Button */}
        <div className="mt-5 pt-4 border-t border-border-dark/60 flex items-center justify-between gap-3 text-[11px] text-text-muted">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-text-muted" />
            <span>{project.startDate} → {project.endDate}</span>
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-brand-primary text-text-secondary hover:text-white border border-border-dark hover:border-brand-primary text-xs font-semibold transition-all duration-200"
          >
            <span>Open Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>

      {/* Edit Project Details Modal */}
      {showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={project}
          onProjectUpdated={(updated) => {
            if (onProjectUpdated) onProjectUpdated(updated);
          }}
        />
      )}

      {/* Delete Project Confirmation Modal */}
      {showDeleteModal && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          project={project}
          onProjectDeleted={(id) => {
            if (onProjectDeleted) onProjectDeleted(id);
          }}
        />
      )}
    </>
  );
};
