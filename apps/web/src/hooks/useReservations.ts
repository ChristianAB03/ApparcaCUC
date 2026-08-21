import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type { Reservation, ReservationState } from '@/types';

interface HistoryParams {
  state?: ReservationState;
  page?: number;
  limit?: number;
}

interface HistoryResponse {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
}

export function useReservationHistory(params?: HistoryParams) {
  return useQuery({
    queryKey: qk.reservations(params),
    queryFn: async () => (await api.get<HistoryResponse>('/reservations', { params })).data,
  });
}

export function useActiveReservation() {
  return useQuery({
    queryKey: qk.activeReservation,
    queryFn: async () =>
      (await api.get<{ reservation: Reservation | null }>('/reservations/active')).data.reservation,
    refetchInterval: 12000,
  });
}

export function useReservation(id?: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: qk.reservation(id ?? ''),
    queryFn: async () => (await api.get<{ reservation: Reservation }>(`/reservations/${id}`)).data.reservation,
  });
}

function invalidateReservationData() {
  queryClient.invalidateQueries({ queryKey: ['reservations'] });
  queryClient.invalidateQueries({ queryKey: ['parking'] });
  queryClient.invalidateQueries({ queryKey: ['notifications'] });
}

export interface CreateReservationInput {
  spaceId: string;
  vehicleId?: string;
  startAt: string;
  durationMinutes: number;
}

export function useCreateReservation() {
  return useMutation({
    mutationFn: async (body: CreateReservationInput) =>
      (await api.post<{ reservation: Reservation }>('/reservations', body)).data.reservation,
    onSuccess: invalidateReservationData,
  });
}

export function useCancelReservation() {
  return useMutation({
    mutationFn: async (id: string) =>
      (await api.patch<{ reservation: Reservation }>(`/reservations/${id}/cancel`, {})).data.reservation,
    onSuccess: invalidateReservationData,
  });
}

export interface AccessScanResult {
  action: 'checkin' | 'checkout';
  spaceCode: string;
  reservation: Reservation;
}

export function useAccessScan() {
  return useMutation({
    mutationFn: async (code: string) =>
      (await api.post<AccessScanResult>('/reservations/access-scan', { code })).data,
    onSuccess: invalidateReservationData,
  });
}
