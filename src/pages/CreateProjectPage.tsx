import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';

export const CreateProjectPage: React.FC = () => {
  return (
    <DashboardLayout
      title="Create New Project"
      subtitle="Initialize an authorized security testing container and engagement context."
    >
      <div className="space-y-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-bg-elevated"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </Link>
          <span className="text-xs font-mono text-text-muted">
            PHASE 4 ENGAGEMENT WIZARD
          </span>
        </div>

        <CreateProjectForm />
      </div>
    </DashboardLayout>
  );
};
