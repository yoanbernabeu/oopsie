'use client';

import type { TimelineEvent } from '@/types';

const typeConfig: Record<string, { dot: string; bg: string; label: string }> = {
  navigation: { dot: 'bg-blue-500', bg: 'bg-blue-50 border-blue-100', label: 'Navigation' },
  click: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-100', label: 'Click' },
  console_error: { dot: 'bg-red-500', bg: 'bg-red-50 border-red-100', label: 'Console Error' },
  network_failure: { dot: 'bg-orange-500', bg: 'bg-orange-50 border-orange-100', label: 'Network Failure' },
};

export function ReportTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) {
    return <p className="text-gray-400 text-sm">No timeline events recorded.</p>;
  }

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="space-y-0">
      {sorted.map((event, i) => {
        const config = typeConfig[event.type] ?? { dot: 'bg-gray-400', bg: 'bg-gray-50 border-gray-200', label: event.type };
        const time = new Date(event.timestamp).toLocaleTimeString();

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-2 h-2 rounded-full ${config.dot} mt-2 ring-4 ring-white`} />
              {i < sorted.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
            </div>
            <div className="flex-1 min-w-0 pb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[13px] font-semibold text-foreground">{config.label}</span>
                <span className="text-xs text-gray-400 tabular-nums">{time}</span>
              </div>
              <div className={`text-sm rounded-lg p-2.5 border ${config.bg}`}>
                {event.type === 'navigation' && (
                  <span className="text-gray-600 font-mono text-[13px] break-all">{String(event.url ?? '')}</span>
                )}
                {event.type === 'click' && (
                  <span className="text-gray-600 font-mono text-[13px] break-all">{String(event.selector ?? '')}</span>
                )}
                {event.type === 'console_error' && (
                  <div>
                    <p className="text-red-600 font-mono text-[13px] break-words">{String(event.message ?? '')}</p>
                    {event.stack != null && (
                      <pre className="mt-1 text-xs text-red-400 overflow-x-auto">{String(event.stack)}</pre>
                    )}
                  </div>
                )}
                {event.type === 'network_failure' && (
                  <span className="text-gray-600 font-mono text-[13px] break-all">
                    {String(event.method ?? 'GET')} {String(event.url ?? '')} &mdash; {String(event.status ?? 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
