'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateProject } from '@/lib/hooks/use-projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [allowedDomains, setAllowedDomains] = useState('*');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [retentionDays, setRetentionDays] = useState(90);
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({
      name,
      allowedDomains: allowedDomains.split(',').map((d) => d.trim()),
      webhookUrl: webhookUrl || null,
      retentionDays,
    }, {
      onSuccess: (project) => router.push(`/projects/${project.id}`),
    });
  };

  return (
    <div className="max-w-md space-y-6 animate-in">
      <div>
        <Link href="/projects" className="text-[13px] text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to projects</Link>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mt-1">New Project</h1>
        <p className="text-gray-500 text-sm mt-0.5">Create a new project to start tracking bugs.</p>
      </div>

      <div className="card-surface rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Website" required autoFocus className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Allowed domains</label>
            <Input value={allowedDomains} onChange={(e) => setAllowedDomains(e.target.value)} placeholder="*, *.example.com" className="h-10" />
            <p className="text-xs text-gray-400">Comma-separated. Use * to allow all origins.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Webhook URL <span className="text-gray-400">(optional)</span></label>
            <Input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://hooks.slack.com/..." className="h-10" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-600">Retention period</label>
            <div className="flex items-center gap-2">
              <Input type="number" value={retentionDays} onChange={(e) => setRetentionDays(Number(e.target.value))} min={1} className="w-20 h-10" />
              <span className="text-sm text-gray-500">days</span>
            </div>
          </div>

          <Button type="submit" disabled={createProject.isPending} className="w-full h-10 bg-coral-500 hover:bg-coral-600 text-white font-medium">
            {createProject.isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </div>
    </div>
  );
}
