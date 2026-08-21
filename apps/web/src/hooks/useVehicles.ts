import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type { Vehicle, VehicleType } from '@/types';

export interface VehicleInput {
  plate: string;
  type: VehicleType;
  brand?: string;
  model?: string;
  color?: string;
  isDefault?: boolean;
}

export function useVehicles() {
  return useQuery({
    queryKey: qk.vehicles,
    queryFn: async () => (await api.get<{ vehicles: Vehicle[] }>('/vehicles')).data.vehicles,
  });
}

const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.vehicles });

export function useCreateVehicle() {
  return useMutation({
    mutationFn: async (body: VehicleInput) => (await api.post<{ vehicle: Vehicle }>('/vehicles', body)).data.vehicle,
    onSuccess: invalidate,
  });
}

export function useUpdateVehicle() {
  return useMutation({
    mutationFn: async ({ id, ...body }: VehicleInput & { id: string }) =>
      (await api.put<{ vehicle: Vehicle }>(`/vehicles/${id}`, body)).data.vehicle,
    onSuccess: invalidate,
  });
}

export function useDeleteVehicle() {
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/vehicles/${id}`)).data,
    onSuccess: invalidate,
  });
}
