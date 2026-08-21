import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { qk } from '@/lib/queryKeys';
import type { NotificationItem } from '@/types';

export function useNotifications() {
  return useQuery({
    queryKey: qk.notifications,
    queryFn: async () => (await api.get<{ notifications: NotificationItem[] }>('/notifications')).data.notifications,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: qk.unread,
    queryFn: async () => (await api.get<{ count: number }>('/notifications/unread-count')).data.count,
    refetchInterval: 15000,
  });
}

const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: qk.notifications });
  queryClient.invalidateQueries({ queryKey: qk.unread });
};

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`, {})).data,
    onSuccess: invalidate,
  });
}

export function useMarkAllNotificationsRead() {
  return useMutation({
    mutationFn: async () => (await api.post('/notifications/read-all', {})).data,
    onSuccess: invalidate,
  });
}
