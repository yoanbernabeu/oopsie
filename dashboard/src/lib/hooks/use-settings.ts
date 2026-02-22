'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { VersionInfo, SetupStatus } from '@/types';

export function useVersion() {
  return useQuery({
    queryKey: ['version'],
    queryFn: async () => {
      const { data } = await api.get('/version');
      return data as VersionInfo;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useSetupStatus() {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: async () => {
      const { data } = await api.get('/setup/status');
      return data as SetupStatus;
    },
  });
}
