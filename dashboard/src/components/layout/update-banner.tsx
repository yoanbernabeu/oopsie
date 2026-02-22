'use client';

import { useState } from 'react';
import { useVersion } from '@/lib/hooks/use-settings';

export function UpdateBanner() {
  const { data: version } = useVersion();
  const [dismissed, setDismissed] = useState(false);

  if (!version?.updateAvailable || dismissed) return null;

  return (
    <div className="bg-coral-50 border-b border-coral-200 px-6 py-2 flex items-center justify-between">
      <p className="text-sm text-coral-700">
        Update available: <strong className="font-semibold text-coral-800">{version.latest}</strong>{' '}
        <span className="text-coral-500">(current: {version.current})</span>{' · '}
        <a
          href="https://github.com/yoanbernabeu/oopsie/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:no-underline text-coral-600"
        >
          View release
        </a>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-coral-400 hover:text-coral-600 text-sm leading-none ml-4"
      >
        &times;
      </button>
    </div>
  );
}
