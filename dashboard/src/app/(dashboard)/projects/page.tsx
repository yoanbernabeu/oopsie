'use client';

import Link from 'next/link';
import { useProjects, useDeleteProject } from '@/lib/hooks/use-projects';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your tracked applications.</p>
        </div>
        <Button asChild className="bg-coral-500 hover:bg-coral-600 text-white text-sm h-9">
          <Link href="/projects/new">New Project</Link>
        </Button>
      </div>

      <div className="card-surface rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {projects?.map((project) => (
            <div key={project.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-gray-400">
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/projects/${project.id}`} className="text-[15px] font-medium text-foreground hover:text-coral-500 transition-colors">
                  {project.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs text-gray-400 font-mono">{project.apiKey.slice(0, 20)}...</code>
                  <div className="flex gap-1">
                    {project.allowedDomains.slice(0, 2).map((d) => (
                      <Badge key={d} variant="secondary" className="text-[11px] h-4 bg-gray-100 text-gray-500 border-0">{d}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 shrink-0 hidden sm:block tabular-nums">
                {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" asChild className="text-coral-500 hover:text-coral-600 text-[13px] h-8">
                  <Link href={`/projects/${project.id}/snippet`}>Snippet</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-500 text-[13px] h-8"
                  onClick={() => {
                    if (confirm('Delete this project? All associated reports will be lost.')) {
                      deleteProject.mutate(project.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {(!projects || projects.length === 0) && !isLoading && (
            <div className="px-5 py-16 text-center">
              <p className="text-gray-400 text-sm">No projects yet.</p>
              <p className="text-gray-400 text-xs mt-1">Create your first project to start tracking bugs.</p>
            </div>
          )}

          {isLoading && (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
