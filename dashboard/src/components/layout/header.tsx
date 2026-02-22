'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { UpdateBanner } from './update-banner';

export function Header() {
  const { logout } = useAuth();

  return (
    <>
      <UpdateBanner />
      <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-white">
        <div />
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Log out
        </Button>
      </header>
    </>
  );
}
