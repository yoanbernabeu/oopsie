'use client';

import { use } from 'react';
import Link from 'next/link';
import { useReport, useUpdateReport } from '@/lib/hooks/use-reports';
import { useUsers } from '@/lib/hooks/use-users';
import type { Report } from '@/types';
import { ReportTimeline } from '@/components/reports/report-timeline';
import { ReportComments } from '@/components/reports/report-comments';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const severityConfig: Record<string, { cls: string; label: string }> = {
  critical: { cls: 'dot-critical', label: 'Critical' },
  high: { cls: 'dot-high', label: 'High' },
  medium: { cls: 'dot-medium', label: 'Medium' },
  low: { cls: 'dot-low', label: 'Low' },
};

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: report, isLoading } = useReport(id);
  const { data: users } = useUsers();
  const updateReport = useUpdateReport();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Report not found.</div>;
  }

  const sev = severityConfig[report.severity] ?? { cls: 'dot-low', label: report.severity };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/reports" className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to reports</Link>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mt-1 break-words">{report.message}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`w-2.5 h-2.5 rounded-full ${sev.cls}`} />
          <span className="text-sm font-medium text-gray-600">{sev.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5 min-w-0">
          {/* Info */}
          <div className="card-surface rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Details</h2>

            <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
              {[
                ['Category', <span key="c" className="capitalize">{report.category}</span>],
                ['Severity', <span key="s" className="capitalize">{report.severity}</span>],
                ['Reporter', report.reporterEmail ?? 'Anonymous'],
                ['Page URL', <span key="u" className="truncate block max-w-[260px] font-mono text-[13px]">{report.pageUrl ?? 'N/A'}</span>],
                ['Date', format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')],
                ['Project', report.project.name],
              ].map(([label, value], i) => (
                <div key={i}>
                  <span className="text-gray-400">{label as string}</span>
                  <p className="text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Device info */}
          {report.deviceInfo && Object.keys(report.deviceInfo).length > 0 && (
            <div className="card-surface rounded-xl p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Device</h2>
              <div className="grid grid-cols-2 gap-y-2 gap-x-8 text-sm">
                {Object.entries(report.deviceInfo).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-gray-400">{key}</span>
                    <p className="text-foreground mt-0.5 break-words">{String(value ?? 'N/A')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Console errors */}
          {report.consoleErrors && report.consoleErrors.length > 0 && (
            <div className="card-surface rounded-xl p-5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Console Errors</h2>
              <div className="space-y-2">
                {report.consoleErrors.map((err, i) => (
                  <div key={i} className="rounded-lg bg-red-50 border border-red-100 p-3">
                    <p className="text-sm font-mono text-red-600 break-words">{err.message}</p>
                    {err.stack && <pre className="mt-1 text-xs text-red-400 overflow-x-auto">{err.stack}</pre>}
                    {err.source && <p className="mt-1 text-xs text-gray-400">{err.source}:{err.lineno}:{err.colno}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card-surface rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Timeline</h2>
            <ReportTimeline events={report.timeline ?? []} />
          </div>
        </div>

        {/* Right */}
        <div className="space-y-5">
          {/* Actions */}
          <div className="card-surface rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</h2>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-500">Status</label>
              <select
                value={report.status}
                onChange={(e) => updateReport.mutate({ id, status: e.target.value as Report['status'] })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-foreground focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/20"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-gray-500">Assigned to</label>
              <select
                value={report.assignedTo?.id ?? ''}
                onChange={(e) => updateReport.mutate({ id, assignedTo: e.target.value ? { id: e.target.value, name: '' } : null })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-foreground focus:outline-none focus:border-coral-400 focus:ring-1 focus:ring-coral-400/20"
              >
                <option value="">Unassigned</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            {report.attachments.length > 0 && (
              <>
                <div className="h-px bg-gray-100" />
                <div className="space-y-2">
                  <h3 className="text-[13px] font-medium text-gray-500">Attachments</h3>
                  {report.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
                        <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                      </svg>
                      <span className="text-coral-500 truncate">{a.filename}</span>
                      <span className="text-gray-400 text-xs shrink-0">({Math.round(a.size / 1024)}KB)</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {report.groupId && (
              <>
                <div className="h-px bg-gray-100" />
                <div>
                  <h3 className="text-[13px] font-medium text-gray-500 mb-1">Group</h3>
                  <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-gray-500 border-0">
                    {report.groupId.slice(0, 12)}...
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Comments */}
          <div className="card-surface rounded-xl p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Comments</h2>
            <ReportComments reportId={id} comments={report.comments} />
          </div>
        </div>
      </div>
    </div>
  );
}
