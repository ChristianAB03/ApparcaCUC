import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type { StateCounts, ParkingSpace, ParkingState } from '@/types';

export function useOverview() {
  return useQuery({
    queryKey: qk.overview,
    queryFn: async () => (await api.get<{ counts: StateCounts }>('/parking/overview')).data.counts,
    refetchInterval: 8000,
  });
}

export interface SpaceFilters {
  zone?: string;
  state?: string;
  type?: string;
}

export function useSpaces(filters?: SpaceFilters) {
  return useQuery({
    queryKey: qk.spaces(filters),
    queryFn: async () =>
      (await api.get<{ spaces: ParkingSpace[] }>('/parking/spaces', { params: filters })).data.spaces,
    refetchInterval: 8000,
  });
}

export function useSetSpaceState() {
  return useMutation({
    mutationFn: async (vars: { id: string; state: ParkingState; source: 'admin' | 'sensor'; note?: string }) =>
      (await api.patch<{ space: ParkingSpace }>(`/parking/spaces/${vars.id}/status`, {
        state: vars.state,
        source: vars.source,
        note: vars.note,
      })).data.space,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parking'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });
}
