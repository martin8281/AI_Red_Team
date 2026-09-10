import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Building2, 
  FolderGit2, 
  Calendar, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { Project, ProjectType, ProjectStatus } from '../../types/project.types';
import { projectService } from '../../services/projectService';
import { Button } from '../ui/Button';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onProjectUpdated: (updatedProject: Project) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onProjectUpdated,
}) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [projectType, setProjectType] = useState<ProjectType>(project.projectType);
  const [organization, setOrganization] = useState(project.organization);
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [leadTester, setLeadTester] = useState(project.leadTester || 'Alex Vance');

  const [errors, setErrors] = useState<{
    name?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || '');
    setProjectType(project.projectType);
    setOrganization(project.organization);
    setStartDate(project.startDate);
    setEndDate(project.endDate);
    setStatus(project.status);
    setLeadTester(project.leadTester || 'Alex Vance');
    setErrors({});
  }, [project, isOpen]);

  if (!isOpen) return null;

  const projectTypes: ProjectType[] = [
    'Web Application Pentest',
    'API Security Assessment',
    'Network Security Assessment',
    'Mobile Application Assessment',
    'Cloud Security Assessment',
    'Infrastructure Assessment',
    'Other',
  ];

  const projectStatuses: ProjectStatus[] = [
    'ACTIVE',
    'DRAFT',
    'ON HOLD',
    'COMPLETED',
    'ARCHIVED',
  ];

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required.';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required.';
    }

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const updated = await projectService.updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || 'No description provided.',
        projectType,
        organization: organization.trim() || 'Internal Security Operations',
        startDate,
        endDate: endDate || startDate,
        status,
        leadTester: leadTester.trim() || 'Alex Vance',
      });

      if (updated) {
        onProjectUpdated(updated);
        onClose();
      } else {
        setErrors({ general: 'Project could not be found or updated.' });
      }
    } catch {
      setErrors({ general: 'Failed to update project details. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-bg-card border border-border-dark rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark bg-bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Edit Engagement Details
              </h3>
              <p className="text-xs text-text-muted font-mono">
                {project.id} · {project.organization}
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {errors.general && (
            <div className="p-3.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Project Name <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Web Application Penetration Test"
              className={`block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
                errors.name ? 'border-[#EF4444] focus:ring-[#EF4444]/30' : 'border-border-dark'
              }`}
            />
            {errors.name && <p className="text-xs text-[#EF4444]">{errors.name}</p>}
          </div>

          {/* Organization & Project Type Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Organization / Client
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Apex Global Financial"
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                />
                <Building2 className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Assessment Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary cursor-pointer"
              >
                {projectTypes.map((t) => (
                  <option key={t} value={t} className="bg-bg-card text-text-primary">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Lead Tester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Engagement Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary cursor-pointer font-mono"
              >
                {projectStatuses.map((s) => (
                  <option key={s} value={s} className="bg-bg-card text-text-primary">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Lead Security Tester
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={leadTester}
                  onChange={(e) => setLeadTester(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="block w-full pl-9 pr-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                />
                <UserCheck className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
            </div>
          </div>

          {/* Date Range Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                Start Date <span className="text-[#EF4444]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`block w-full pl-9 pr-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary font-mono ${
                    errors.startDate ? 'border-[#EF4444]' : 'border-border-dark'
                  }`}
                />
                <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
              {errors.startDate && <p className="text-xs text-[#EF4444]">{errors.startDate}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-text-secondary">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`block w-full pl-9 pr-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary font-mono ${
                    errors.endDate ? 'border-[#EF4444]' : 'border-border-dark'
                  }`}
                />
                <Calendar className="w-4 h-4 text-text-muted absolute left-3 top-3" />
              </div>
              {errors.endDate && <p className="text-xs text-[#EF4444]">{errors.endDate}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-secondary">
              Scope & Assessment Objective Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the primary security assessment parameters, target environments, and testing constraints..."
              className="block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-border-dark flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
