import { useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, XCircle, CalendarClock } from 'lucide-react';
import { useAdminReservations, useAdminCancelReservation } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/Modal';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { RESERVATION_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime } from '@/lib/format';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types';

const TABS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activas' },
  { value: 'checked_in', label: 'En curso' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
];

export default function AdminReservationsPage() {
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<Reservation | null>(null);
  const limit = 10;

  const { data, isLoading } = useAdminReservations({ state: state || undefined, page, limit });
  const cancel = useAdminCancelReservation();
  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  const doCancel = async () => {
    if (!cancelling) return;
    try {
      await cancel.mutateAsync(cancelling.id);
      toast.success('Reserva cancelada');
      setCancelling(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Reservas" description="Todas las reservas de los usuarios de la plataforma." />

      <div className="mb-4">
        <Tabs
          tabs={TABS}
          value={state}
          onChange={(v) => {
            setState(v);
            setPage(1);
          }}
        />
      </div>

      <Card className="overflow-hidden">
        {isLoading || !data ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : data.reservations.length === 0 ? (
          <EmptyState className="m-4 border-0" icon={<CalendarClock className="h-6 w-6" />} title="Sin reservas" description="No hay reservas para este filtro." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Reserva</th>
                  <th className="px-4 py-3 font-medium">Espacio</th>
                  <th className="px-4 py-3 font-medium">Llegada</th>
                  <th className="px-4 py-3 font-medium">Vehículo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.reservations.map((r) => {
                  const canCancel = r.state === 'active' || r.state === 'checked_in';
                  return (
                    <tr key={r.id} className="hover:bg-surface/60">
                      <td className="px-4 py-3">
                        {r.user ? (
                          <div className="flex items-center gap-2.5">
                            <Avatar name={r.user.name} color={r.user.avatarColor} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-ink">{r.user.name}</p>
                              <p className="truncate text-xs text-ink-muted">{r.user.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-ink-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-soft">{r.code}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{r.spaceCode}</td>
                      <td className="px-4 py-3 text-ink-soft">{fmtDateTime(r.startAt)}</td>
                      <td className="px-4 py-3 text-ink-soft">{r.vehiclePlate ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', RESERVATION_STATE_CONFIG[r.state].badge)}>
                          {RESERVATION_STATE_CONFIG[r.state].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canCancel && (
                          <button
                            onClick={() => setCancelling(r)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-state-occupied hover:bg-state-occupied/10"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-ink-soft">
            Página {page} de {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={doCancel}
        loading={cancel.isPending}
        title="Cancelar reserva"
        description={cancelling ? `¿Cancelar la reserva ${cancelling.code} (${cancelling.spaceCode})?` : ''}
        confirmLabel="Sí, cancelar"
        cancelLabel="No"
      />
    </div>
  );
}
