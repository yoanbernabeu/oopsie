'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSnippet } from '@/lib/hooks/use-projects';
import { SnippetViewer } from '@/components/projects/snippet-viewer';

export default function SnippetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: snippet, isLoading } = useSnippet(id);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;
  if (!snippet) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Snippet not found.</div>;

  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <div>
        <Link href={`/projects/${id}`} className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to project</Link>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mt-1">Integration Snippet</h1>
        <p className="text-gray-500 text-sm mt-0.5">Copy this code to integrate Oopsie into your app.</p>
      </div>

      <SnippetViewer snippet={snippet} />
    </div>
  );
}
