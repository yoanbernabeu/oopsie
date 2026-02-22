'use client';

import { useProjects } from '@/lib/hooks/use-projects';
import { Input } from '@/components/ui/input';

interface FiltersProps {
  filters: Record<string, string>;
  onChange: (filters: Record<string, string>) => void;
}

export function ReportFilters({ filters, onChange }: FiltersProps) {
  const { data: projects } = useProjects();

  const updateFilter = (key: string, value: string) => {
    const next = { ...filters };
    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }
    onChange(next);
  };

  const selectClass = "w-full px-3 py-1.5 rounded-lg text-sm bg-white border border-gray-200 text-foreground focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/20";

  return (
    <div className="card-surface rounded-xl p-4 space-y-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</h3>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Search</label>
        <Input
          type="text"
          value={filters.search ?? ''}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search reports..."
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Project</label>
        <select value={filters.project ?? ''} onChange={(e) => updateFilter('project', e.target.value)} className={selectClass}>
          <option value="">All projects</option>
          {projects?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Status</label>
        <select value={filters.status ?? ''} onChange={(e) => updateFilter('status', e.target.value)} className={selectClass}>
          <option value="">All</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Category</label>
        <select value={filters.category ?? ''} onChange={(e) => updateFilter('category', e.target.value)} className={selectClass}>
          <option value="">All</option>
          <option value="ui">UI</option>
          <option value="crash">Crash</option>
          <option value="performance">Performance</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">Severity</label>
        <select value={filters.severity ?? ''} onChange={(e) => updateFilter('severity', e.target.value)} className={selectClass}>
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
    </div>
  );
}
