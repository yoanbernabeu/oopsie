'use client';

import { useState } from 'react';
import type { Snippet } from '@/types';
import { Button } from '@/components/ui/button';

export function SnippetViewer({ snippet }: { snippet: Snippet }) {
  const [tab, setTab] = useState<'npm' | 'cdn'>('npm');
  const [copied, setCopied] = useState(false);

  const code = tab === 'npm' ? snippet.npm : snippet.cdn;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-surface rounded-xl overflow-hidden">
      <div className="flex items-center border-b border-gray-100 px-1">
        {(['npm', 'cdn'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              tab === t ? 'text-coral-500' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.toUpperCase()}
            {tab === t && <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-coral-500 rounded-full" />}
          </button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-gray-400 hover:text-gray-600 text-[13px] h-8 mr-2">
          {copied ? (
            <span className="flex items-center gap-1 text-emerald-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
              Copy
            </span>
          )}
        </Button>
      </div>
      <pre className="p-5 overflow-x-auto text-sm bg-gray-900 text-gray-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
