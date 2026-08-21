import { Bell, CheckCheck, CalendarClock, MapPin, Info, ScanLine, type LucideIcon } from 'lucide-react';
import {
  useNotifications,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/useNotifications';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { fromNow } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types';

const TYPE_ICON: Record<NotificationType, LucideIcon> = {
  reservation: CalendarClock,
  space: MapPin,
  access: ScanLine,
  system: Info,
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const unread = notifications?.filter((n) => !n.read).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Notificaciones"
        description="Avisos sobre tus reservas y el estado del estacionamiento."
        actions={
          unread > 0 ? (
            <Button variant="outline" onClick={() => markAll.mutate()} loading={markAll.isPending}>
              <CheckCheck className="h-4 w-4" /> Marcar todas leídas
            </Button>
          ) : undefined
        }
      />

      {isLoading || !notifications ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Bell className="h-6 w-6" />} title="Sin notificaciones" description="Aquí verás tus avisos." />
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = TYPE_ICON[n.type] ?? Info;
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markOne.mutate(n.id)}
                className={cn(
                  'card flex w-full items-start gap-4 p-4 text-left transition-colors',
                  !n.read && 'border-brand/20 bg-brand/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    n.read ? 'bg-surface text-ink-muted' : 'bg-brand/10 text-brand',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-ink">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-brand" />}
                  </div>
                  <p className="mt-0.5 text-sm text-ink-soft">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-muted">{fromNow(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
