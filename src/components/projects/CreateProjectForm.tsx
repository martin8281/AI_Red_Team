import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FolderPlus, 
  Building2, 
  Calendar, 
  FileText, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { ProjectType, ProjectStatus } from '../../types/project.types';
import { projectService } from '../../services/projectService';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const CreateProjectForm: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('Web Application Pentest');
  const [organization, setOrganization] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');

  const [errors, setErrors] = useState<{
    name?: string;
    projectType?: string;
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectTypes: ProjectType[] = [
    'Web Application Pentest',
    'API Security Assessment',
    'Network Security Assessment',
    'Mobile Application Assessment',
    'Cloud Security Assessment',
    'Infrastructure Assessment',
    'Other',
  ];

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required.';
    }

    if (!projectType) {
      newErrors.projectType = 'Project type is required.';
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
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const created = await projectService.createProject({
        ownerId: 'usr-001',
        name: name.trim(),
        description: description.trim() || 'No description provided.',
        projectType,
        organization: organization.trim() || 'Internal Security Operations',
        startDate,
        endDate: endDate || startDate,
        status,
        leadTester: 'Alex Vance',
      });

      navigate(`/projects/${created.id}`);
    } catch {
      setErrors({ general: 'Failed to create project. Please verify inputs and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto" noValidate>
      {/* General Error Banner */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-start gap-2.5 text-xs text-[#EF4444]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Main Info Card */}
      <Card variant="default" className="p-6 sm:p-8 bg-bg-card border-border-dark space-y-6 shadow-card-dark">
        <div className="flex items-center justify-between pb-4 border-b border-border-dark">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Engagement Details
              </h2>
              <p className="text-xs text-text-muted">
                Define the authorized security assessment container and boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Project Name */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="proj-name" className="block text-xs font-semibold text-text-secondary tracking-wide">
            Project Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            id="proj-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 Web Application Penetration Test"
            className={`block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border transition-all duration-200 placeholder:text-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary ${
              errors.name ? 'border-[#EF4444]' : 'border-border-dark hover:border-border-subtle'
            }`}
          />
          {errors.name && <p className="text-[11px] text-[#EF4444] font-medium">{errors.name}</p>}
        </div>

        {/* Project Type & Organization Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Project Type */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="proj-type" className="block text-xs font-semibold text-text-secondary tracking-wide">
              Assessment Type <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative">
              <select
                id="proj-type"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer appearance-none"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Client / Organization */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="proj-org" className="block text-xs font-semibold text-text-secondary tracking-wide">
              Client / Target Organization
            </label>
            <div className="relative">
              <input
                id="proj-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Apex Global Finance"
                className="block w-full px-3.5 py-2.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="proj-desc" className="block text-xs font-semibold text-text-secondary tracking-wide">
            Engagement Description & Objectives
          </label>
          <textarea
            id="proj-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe assessment objectives, testing methodologies, and rules of engagement constraints..."
            className="block w-full p-3.5 bg-bg-elevated text-text-primary text-sm rounded-lg border border-border-dark hover:border-border-subtle focus:outline-none focus:ring-2 focus:ring-brand-primary/50 placeholder:text-text-disabled"
          />
        </div>

        {/* Timeline & Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Start Date */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="proj-start" className="block text-xs font-semibold text-text-secondary tracking-wide">
              Start Date <span className="text-[#EF4444]">*</span>
            </label>
            <input
              id="proj-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="block w-full px-3 py-2 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
            {errors.startDate && <p className="text-[11px] text-[#EF4444] font-medium">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="proj-end" className="block text-xs font-semibold text-text-secondary tracking-wide">
              Estimated End Date
            </label>
            <input
              id="proj-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="block w-full px-3 py-2 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            />
            {errors.endDate && <p className="text-[11px] text-[#EF4444] font-medium">{errors.endDate}</p>}
          </div>

          {/* Initial Status */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="proj-status" className="block text-xs font-semibold text-text-secondary tracking-wide">
              Initial Status
            </label>
            <select
              id="proj-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="block w-full px-3 py-2 bg-bg-elevated text-text-primary text-xs sm:text-sm rounded-lg border border-border-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/50 cursor-pointer"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ON HOLD">ON HOLD</option>
            </select>
          </div>
        </div>

        {/* Security / Scope Safety Assurance */}
        <div className="p-3 rounded-lg bg-bg-surface border border-border-dark flex items-start gap-2.5 text-xs text-text-muted">
          <Shield className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <span>
            Creating this project establishes the context for authorized target scopes, findings management, risk scoring, and AI co-pilot analyses.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-dark">
          <Button
            to="/projects"
            variant="outline"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          >
            {isSubmitting ? 'Creating Engagement...' : 'Create Project'}
          </Button>
        </div>

      </Card>
    </form>
  );
};
