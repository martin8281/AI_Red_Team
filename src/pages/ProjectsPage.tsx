import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderPlus, Info, Loader2 } from 'lucide-react';
import { Project, ProjectSortOption } from '../types/project.types';
import { projectService } from '../services/projectService';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFilters } from '../components/projects/ProjectFilters';
import { Button } from '../components/ui/Button';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<ProjectSortOption>('recently_updated');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects({
        search: searchQuery,
        status: statusFilter,
        sort: sortBy,
      });
      setProjects(data);
    } catch {
      // handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter, sortBy]);

  return (
    <DashboardLayout
      title="Projects & Engagements"
      subtitle="Manage authorized security testing containers, scopes, and objectives."
    >
      <div className="space-y-6">
        
        {/* Page Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              Active Engagements
            </h2>
            <p className="text-xs text-text-muted">
              Security testing engagements providing context for target scopes and AI finding analysis.
            </p>
          </div>

          <Button
            to="/projects/new"
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        </div>

        {/* Filter Controls */}
        <ProjectFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={projects.length}
        />

        {/* Project Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-7 h-7 text-brand-primary animate-spin" />
            <span className="text-xs text-text-muted font-mono">Loading Authorized Projects...</span>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-bg-card border border-dashed border-border-dark text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mx-auto text-brand-primary">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-text-primary">No Projects Found</h3>
              <p className="text-xs text-text-muted">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'No engagement matches your filter criteria. Try adjusting search terms.'
                  : 'Get started by creating your first authorized security testing engagement.'}
              </p>
            </div>
            {searchQuery || statusFilter !== 'ALL' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                to="/projects/new"
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Create Engagement
              </Button>
            )}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
