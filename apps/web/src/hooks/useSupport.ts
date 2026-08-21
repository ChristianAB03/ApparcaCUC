import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type { SupportTicket, TicketCategory } from '@/types';

export interface TicketInput {
  category: TicketCategory;
  subject: string;
  message: string;
  reference?: string;
}

export function useMyTickets() {
  return useQuery({
    queryKey: qk.tickets,
    queryFn: async () => (await api.get<{ tickets: SupportTicket[] }>('/support/reports')).data.tickets,
  });
}

export function useCreateTicket() {
  return useMutation({
    mutationFn: async (body: TicketInput) =>
      (await api.post<{ ticket: SupportTicket }>('/support/reports', body)).data.ticket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.tickets }),
  });
}
