import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type {
  AdminOverview,
  ParkingSpace,
  Reservation,
  AdminUser,
  SupportTicket,
  Statistics,
  AuditLog,
  TicketState,
  SpaceType,
  ParkingState,
} from '@/types';

export function useAdminOverview() {
  return useQuery({
    queryKey: qk.admin.overview,
    queryFn: async () => (await api.get<AdminOverview>('/admin/overview')).data,
    refetchInterval: 8000,
  });
}

export function useAdminSpaces() {
  return useQuery({
    queryKey: qk.admin.spaces,
    queryFn: async () => (await api.get<{ spaces: ParkingSpace[] }>('/admin/spaces')).data.spaces,
    refetchInterval: 8000,
  });
}

export function useAdminReservations(params?: { state?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: qk.admin.reservations(params),
    queryFn: async () =>
      (await api.get<{ reservations: Reservation[]; total: number; page: number; limit: number }>(
        '/admin/reservations',
        { params },
      )).data,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: qk.admin.users,
    queryFn: async () => (await api.get<{ users: AdminUser[] }>('/admin/users')).data.users,
  });
}

export function useAdminTickets(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: qk.admin.tickets(params),
    queryFn: async () =>
      (await api.get<{ tickets: SupportTicket[]; total: number }>('/admin/reports', { params })).data,
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: qk.admin.stats,
    queryFn: async () => (await api.get<Statistics>('/admin/statistics')).data,
    refetchInterval: 20000,
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: qk.admin.audit,
    queryFn: async () => (await api.get<{ logs: AuditLog[] }>('/admin/audit-logs')).data.logs,
    refetchInterval: 10000,
  });
}

function invalidateAdmin() {
  queryClient.invalidateQueries({ queryKey: ['admin'] });
  queryClient.invalidateQueries({ queryKey: ['parking'] });
}

export function useCreateSpace() {
  return useMutation({
    mutationFn: async (body: { zone: string; position: number; type?: SpaceType; level?: number; state?: ParkingState }) =>
      (await api.post<{ space: ParkingSpace }>('/admin/spaces', body)).data.space,
    onSuccess: invalidateAdmin,
  });
}

export function useUpdateSpace() {
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; type?: SpaceType; level?: number; note?: string }) =>
      (await api.patch<{ space: ParkingSpace }>(`/admin/spaces/${id}`, body)).data.space,
    onSuccess: invalidateAdmin,
  });
}

export function useAdminCancelReservation() {
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch<{ reservation: Reservation }>(`/admin/reservations/${id}/cancel`, {})).data.reservation,
    onSuccess: invalidateAdmin,
  });
}

export function useUpdateTicket() {
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; status?: TicketState; adminNote?: string }) =>
      (await api.patch<{ ticket: SupportTicket }>(`/admin/reports/${id}`, body)).data.ticket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}
