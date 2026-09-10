import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FolderGit2, 
  Calendar, 
  Building2, 
  ShieldCheck, 
  Clock,
  UserCheck, 
  Sparkles,
  Layers,
  Edit3,
  Trash2
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types/project.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EditProjectModal } from './EditProjectModal';
import { DeleteProjectModal } from './DeleteProjectModal';

interface ProjectHeaderProps {
  project: Project;
  onProjectUpdated?: (updatedProject: Project) => void;
  onProjectDeleted?: (projectId: string) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ 
  project, 
  onProjectUpdated, 
  onProjectDeleted 
}) => {
  const navigate = useNavigate();
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

  const handleDeleted = (deletedId: string) => {
    if (onProjectDeleted) {
      onProjectDeleted(deletedId);
    }
    navigate('/projects');
  };

  return (
    <>
      <div className="p-6 rounded-2xl bg-bg-card border border-border-dark space-y-4 shadow-card-dark relative overflow-hidden">
        {/* Top ambient brand strip */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary via-[#A78BFA] to-brand-secondary" />

        {/* Breadcrumb & Return Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-bg-elevated"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-muted">{project.id}</span>
            {getStatusBadge(project.status)}

            {/* Quick Action Buttons: Edit & Delete */}
            <div className="flex items-center gap-1 pl-2 border-l border-border-dark ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                icon={<Edit3 className="w-3.5 h-3.5" />}
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="text-text-muted hover:text-rose-400 hover:bg-rose-950/20"
                icon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Main Title Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-text-primary tracking-tight">
              {project.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-primary" />
                <span className="font-medium text-text-primary">{project.organization}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-brand-primary" />
                <span>{project.projectType}</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span>{project.startDate} → {project.endDate}</span>
              </div>
            </div>
          </div>

          {/* Actions & Progress Metric */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <Button
              to={`/projects/${project.id}/workspace`}
              variant="primary"
              size="sm"
              icon={<Layers className="w-3.5 h-3.5" />}
            >
              Engagement Workspace
            </Button>

            <Button
              to={`/assistant?projectId=${project.id}&contextType=project`}
              variant="outline"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Ask Co-Pilot
            </Button>

            <div className="flex items-center gap-4 bg-bg-surface p-3 rounded-xl border border-border-dark">
              <div className="text-left">
                <div className="text-[10px] text-text-muted font-mono uppercase">Lead Tester</div>
                <div className="text-xs font-bold text-text-primary flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-brand-primary" />
                  <span>{project.leadTester || 'Alex Vance'}</span>
                </div>
              </div>

              <div className="w-px h-8 bg-border-dark" />

              <div className="min-w-[100px] text-left">
                <div className="flex items-center justify-between text-[10px] text-text-muted font-mono uppercase">
                  <span>Progress</span>
                  <span className="font-bold text-text-primary">{project.progress}%</span>
                </div>
                <div className="w-full bg-[#1E293B] h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-brand-primary rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
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

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <DeleteProjectModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          project={project}
          onProjectDeleted={handleDeleted}
        />
      )}
    </>
  );
};
