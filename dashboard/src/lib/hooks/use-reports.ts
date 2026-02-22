'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Report } from '@/types';

export function useReports(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const { data } = await api.get('/reports', { params });
      return (Array.isArray(data) ? data : data['hydra:member'] ?? []) as Report[];
    },
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data } = await api.get(`/reports/${id}`);
      return data as Report;
    },
    enabled: !!id,
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Report> & { id: string }) => {
      // Convert nested relations to IRIs for API Platform
      const payload: Record<string, unknown> = { ...patch };
      if (payload.assignedTo && typeof payload.assignedTo === 'object' && 'id' in (payload.assignedTo as Record<string, unknown>)) {
        const userId = (payload.assignedTo as { id: string }).id;
        payload.assignedTo = userId ? `/api/v1/users/${userId}` : null;
      }
      const { data } = await api.patch(`/reports/${id}`, payload, {
        headers: { 'Content-Type': 'application/merge-patch+json' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, content }: { reportId: string; content: string }) => {
      const { data } = await api.post(`/reports/${reportId}/comments`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}
