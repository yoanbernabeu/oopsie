'use client';

import { useRouter } from 'next/navigation';
import { useReports } from '@/lib/hooks/use-reports';
import { useProjects } from '@/lib/hooks/use-projects';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const statusLabel: Record<string, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

const severityDot: Record<string, string> = {
  critical: 'dot-critical',
  high: 'dot-high',
  medium: 'dot-medium',
  low: 'dot-low',
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: reports, isLoading: loadingReports } = useReports();
  const { data: projects, isLoading: loadingProjects } = useProjects();

  const newReports = reports?.filter((r) => r.status === 'new') ?? [];
  const todayReports = reports?.filter((r) => {
    const today = new Date().toDateString();
    return new Date(r.createdAt).toDateString() === today;
  }) ?? [];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Overview of your bug reports and projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Reports today', value: loadingReports ? '—' : todayReports.length },
          { label: 'Open reports', value: loadingReports ? '—' : newReports.length },
          { label: 'Projects', value: loadingProjects ? '—' : projects?.length ?? 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card-surface rounded-xl p-5 hover:shadow-md transition-shadow duration-200"
          >
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div className="card-surface rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold text-foreground">Recent reports</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/reports')}
            className="text-coral-500 hover:text-coral-600 text-sm h-8"
          >
            View all &rarr;
          </Button>
        </div>

        <div className="divide-y divide-gray-100">
          {reports?.slice(0, 8).map((report) => (
            <div
              key={report.id}
              onClick={() => router.push(`/reports/${report.id}`)}
              className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot[report.severity] ?? 'dot-low'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{report.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">{report.project.name}</p>
              </div>
              <Badge
                variant="secondary"
                className="text-xs h-5 bg-gray-100 text-gray-500 border-0 shrink-0"
              >
                {statusLabel[report.status] ?? report.status}
              </Badge>
              <span className="text-xs text-gray-400 shrink-0 hidden sm:block tabular-nums">
                {format(new Date(report.createdAt), 'MMM d')}
              </span>
            </div>
          ))}

          {(!reports || reports.length === 0) && !loadingReports && (
            <div className="px-5 py-12 text-center">
              <p className="text-gray-400 text-sm">No reports yet.</p>
              <p className="text-gray-400 text-xs mt-1">Reports will appear here once your SDK sends them.</p>
            </div>
          )}

          {loadingReports && (
            <div className="px-5 py-12 text-center text-gray-400 text-sm">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
