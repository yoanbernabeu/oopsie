'use client';

import { useState, useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext, getToken, setToken as storeToken, removeToken } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 1000 * 60, retry: 1 },
    },
  }));

  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setTokenState(getToken());
    setReady(true);
  }, []);

  const login = useCallback((newToken: string) => {
    storeToken(newToken);
    setTokenState(newToken);
    router.push('/');
  }, [router]);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!token;
  const isPublicPage = pathname === '/login' || pathname === '/setup';

  useEffect(() => {
    if (!ready) return;

    async function checkSetupAndAuth() {
      try {
        const { data } = await api.get('/setup/status');
        if (data.setupNeeded) {
          if (pathname !== '/setup') {
            router.push('/setup');
          }
          return;
        }
      } catch {
        // API unreachable — skip setup check
      }

      if (!isAuthenticated && !isPublicPage) {
        const storedToken = getToken();
        if (!storedToken) {
          router.push('/login');
        }
      }
    }

    checkSetupAndAuth();
  }, [ready, isAuthenticated, isPublicPage, pathname, router]);

  // Don't render protected content until auth state is resolved
  const showContent = ready && (isPublicPage || isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
        {showContent ? children : null}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
