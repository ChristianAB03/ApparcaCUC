import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useClickAway } from '@/hooks/useClickAway';
import {
  useNotifications,
  useUnreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/hooks/useNotifications';
import { fromNow } from '@/lib/format';
import { cn } from '@/lib/utils';

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickAway(ref, () => setOpen(false));

  const { data: unread = 0 } = useUnreadCount();
  const { data: notifications = [] } = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markOne = useMarkNotificationRead();
  const navigate = useNavigate();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink"
        aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] animate-scale-in overflow-hidden rounded-2xl border border-line bg-card shadow-elevated">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display font-semibold text-ink">Notificaciones</span>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Marcar leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-muted">Sin notificaciones por ahora.</p>
            ) : (
              notifications.slice(0, 8).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markOne.mutate(n.id)}
                  className={cn(
                    'flex w-full gap-3 border-b border-line/70 px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface',
                    !n.read && 'bg-brand/[0.035]',
                  )}
                >
                  <span
                    className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-transparent' : 'bg-brand')}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink">{n.title}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">{n.message}</span>
                    <span className="mt-1 block text-[0.68rem] text-ink-muted">{fromNow(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
          <button
            onClick={() => {
              setOpen(false);
              navigate('/app/notificaciones');
            }}
            className="block w-full border-t border-line py-2.5 text-center text-sm font-medium text-brand transition-colors hover:bg-surface"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  );
}
