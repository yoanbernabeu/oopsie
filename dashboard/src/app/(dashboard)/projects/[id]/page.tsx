'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useProject, useUpdateProject, useRegenerateKey } from '@/lib/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject();
  const regenerateKey = useRegenerateKey();

  const [name, setName] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [retentionDays, setRetentionDays] = useState(90);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setAllowedDomains(project.allowedDomains.join(', '));
      setWebhookUrl(project.webhookUrl ?? '');
      setRetentionDays(project.retentionDays);
    }
  }, [project]);

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>;
  if (!project) return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Project not found.</div>;

  const handleSave = () => {
    updateProject.mutate({
      id,
      name,
      allowedDomains: allowedDomains.split(',').map((d) => d.trim()),
      webhookUrl: webhookUrl || null,
      retentionDays,
    });
  };

  return (
    <div className="max-w-md space-y-6 animate-in">
      <div>
        <Link href="/projects" className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to projects</Link>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mt-1">{project.name}</h1>
        <p className="text-gray-500 text-sm mt-0.5">Project settings and integration.</p>
      </div>

      {/* API Key */}
      <div className="card-surface rounded-xl p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">API Key</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2.5 bg-gray-50 rounded-lg text-[13px] font-mono text-foreground truncate border border-gray-100">{project.apiKey}</code>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-[13px] h-9"
            onClick={() => {
              if (confirm('Regenerate API key? Existing integrations will break.')) {
                regenerateKey.mutate(id);
              }
            }}
          >
            Regenerate
          </Button>
        </div>
        <Button variant="ghost" size="sm" asChild className="text-coral-500 hover:text-coral-600 text-[13px] h-8 mt-2 -ml-2">
          <Link href={`/projects/${id}/snippet`}>View integration snippet &rarr;</Link>
        </Button>
      </div>

      {/* Settings */}
      <div className="card-surface rounded-xl p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Settings</h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Allowed domains</label>
            <Input value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} className="h-10" />
            <p className="text-xs text-gray-400">Comma-separated. Use * to allow all origins.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Webhook URL</label>
            <Input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/..." className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Retention period</label>
            <div className="flex items-center gap-2">
              <Input type="number" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} min={1} className="w-20 h-10" />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          <Button onClick={handleSave} disabled={updateProject.isPending} className="w-full h-10 bg-coral-500 hover:bg-coral-600 text-white font-medium">
            {updateProject.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
