'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser } from '@/lib/hooks/use-users';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const deleteUser = useDeleteUser();
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate({ email, name, plainPassword: password }, {
      onSuccess: () => {
        setShowForm(false);
        setEmail('');
        setName('');
        setPassword('');
      },
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage dashboard access.</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className={showForm ? '' : 'bg-coral-500 hover:bg-coral-600 text-white text-sm h-9'}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {showForm && (
        <div className="card-surface rounded-xl p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">New user</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required autoFocus className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" required className="h-10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" required className="h-10" />
            </div>
            <Button type="submit" disabled={createUser.isPending} className="bg-coral-500 hover:bg-coral-600 text-white text-sm h-9">
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </div>
      )}

      <div className="card-surface rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-100">
          {users?.map((user) => (
            <div key={user.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-coral-50 text-coral-500 flex items-center justify-center text-[13px] font-bold shrink-0 ring-1 ring-coral-100">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 hidden sm:block tabular-nums">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-500 text-[13px] h-8"
                onClick={() => {
                  if (confirm(`Delete user "${user.name}"?`)) deleteUser.mutate(user.id);
                }}
              >
                Delete
              </Button>
            </div>
          ))}

          {(!users || users.length === 0) && !isLoading && (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">No users found.</div>
          )}

          {isLoading && (
            <div className="px-5 py-16 text-center text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      </div>
    </div>
  );
}
