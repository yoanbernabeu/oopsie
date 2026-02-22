'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'account' | 'project' | 'done';

export default function SetupPage() {
  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [instanceName, setInstanceName] = useState('My Oopsie');
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');
  const [snippet, setSnippet] = useState('');
  const { login } = useAuth();

  const steps: Step[] = ['account', 'project', 'done'];

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/setup', { email, name, password, instanceName });
      const { data } = await api.post('/auth/login', { email, password });
      login(data.token);
      setStep('project');
    } catch {
      setError('Failed to create admin account.');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data: project } = await api.post('/projects', { name: projectName });
      const { data: snippetData } = await api.get(`/projects/${project.id}/snippet`);
      setSnippet(snippetData.npm);
      setStep('done');
    } catch {
      setError('Failed to create project.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-[440px] px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-coral-500 mb-5 shadow-lg shadow-coral-500/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15h8" />
              <circle cx="9" cy="9" r="1" fill="white" />
              <circle cx="15" cy="9" r="1" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Set up Oopsie</h1>
          <p className="text-gray-500 text-sm mt-1.5">Configure your instance in 2 minutes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                i <= steps.indexOf(step) ? 'bg-coral-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm mb-5">
              {error}
            </div>
          )}

          {step === 'account' && (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">Create admin account</h2>
                <p className="text-sm text-gray-500 mt-1">This will be the first admin user.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoFocus className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@oopsie.dev" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600">Password</label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" required className="h-10" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600">Instance name</label>
                <Input value={instanceName} onChange={(e) => setInstanceName(e.target.value)} placeholder="My Oopsie" className="h-10" />
              </div>
              <Button type="submit" className="w-full h-10 bg-coral-500 hover:bg-coral-600 text-white font-medium">Continue</Button>
            </form>
          )}

          {step === 'project' && (
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-foreground">Create your first project</h2>
                <p className="text-sm text-gray-500 mt-1">A project represents one app or site you want to track.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-600">Project name</label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="My Website" required autoFocus className="h-10" />
              </div>
              <Button type="submit" className="w-full h-10 bg-coral-500 hover:bg-coral-600 text-white font-medium">Create project</Button>
            </form>
          )}

          {step === 'done' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 mb-3 ring-1 ring-emerald-200">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-lg font-display font-semibold text-foreground">You&apos;re all set!</h2>
                <p className="text-sm text-gray-500 mt-1">Add this snippet to your application:</p>
              </div>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <pre className="p-4 text-sm overflow-x-auto bg-gray-900 text-gray-100 font-mono leading-relaxed">
                  <code>{snippet}</code>
                </pre>
              </div>
              <Button asChild className="w-full h-10 bg-coral-500 hover:bg-coral-600 text-white font-medium">
                <a href="/">Go to Dashboard</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
