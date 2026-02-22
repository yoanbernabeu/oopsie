'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReports } from '@/lib/hooks/use-reports';
import { ReportFilters } from '@/components/reports/report-filters';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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

export default function ReportsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data: reports, isLoading } = useReports(filters);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">All bug reports across your projects.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <div className="w-56 shrink-0 hidden lg:block">
          <ReportFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Report list */}
        <div className="flex-1 min-w-0 card-surface rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              {reports ? `${reports.length} report${reports.length !== 1 ? 's' : ''}` : 'Loading...'}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {reports?.map((report) => (
              <div
                key={report.id}
                onClick={() => router.push(`/reports/${report.id}`)}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot[report.severity] ?? 'dot-low'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{report.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {report.project.name} &middot; <span className="capitalize">{report.category}</span>
                    {report.pageUrl && <> &middot; {report.pageUrl}</>}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs h-5 bg-gray-100 text-gray-500 border-0 shrink-0"
                >
                  {statusLabel[report.status] ?? report.status}
                </Badge>
                <span className="text-xs text-gray-400 shrink-0 hidden sm:block tabular-nums">
                  {format(new Date(report.createdAt), 'MMM d, HH:mm')}
                </span>
              </div>
            ))}

            {(!reports || reports.length === 0) && !isLoading && (
              <div className="px-5 py-16 text-center">
                <p className="text-gray-400 text-sm">No reports match your filters.</p>
              </div>
            )}

            {isLoading && (
              <div className="px-5 py-16 text-center text-gray-400 text-sm">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
