'use client';

import { useVersion } from '@/lib/hooks/use-settings';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const { data: version } = useVersion();

  return (
    <div className="max-w-md space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Instance configuration and information.</p>
      </div>

      <div className="card-surface rounded-xl p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Version</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Current version</span>
            <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-foreground border-0">{version?.current ?? '...'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Latest version</span>
            <Badge variant="secondary" className="font-mono text-xs bg-gray-100 text-foreground border-0">{version?.latest ?? '...'}</Badge>
          </div>
          {version?.updateAvailable && (
            <div className="rounded-lg bg-coral-50 border border-coral-200 p-3 mt-2">
              <p className="text-sm text-coral-700">
                An update is available!{' '}
                <a href="https://github.com/yoanbernabeu/oopsie/releases" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-coral-600 hover:no-underline">
                  View release notes
                </a>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card-surface rounded-xl p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">About</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Oopsie is a user-initiated bug reporting tool. Data only leaves the browser when the user explicitly clicks &quot;Report a bug.&quot;
        </p>
        <div className="h-px bg-gray-100 my-4" />
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">License</span>
            <span className="text-foreground">AGPLv3</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Source code</span>
            <a href="https://github.com/yoanbernabeu/oopsie" target="_blank" rel="noopener noreferrer" className="text-coral-500 hover:text-coral-600 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
