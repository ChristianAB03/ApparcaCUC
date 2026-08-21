import { useState } from 'react';
import { History, ChevronLeft, ChevronRight, MapPin, Car, CalendarClock, Clock, Hash } from 'lucide-react';
import { useReservationHistory } from '@/hooks/useReservations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { RESERVATION_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime, fmtDuration } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Reservation, ReservationState } from '@/types';

const TABS = [
  { value: '', label: 'Todas' },
  { value: 'active', label: 'Activa' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'expired', label: 'Expirada' },
];

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 text-ink-muted" />
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="ml-auto text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default function HistoryPage() {
  const [state, setState] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Reservation | null>(null);
  const limit = 8;

  const { data, isLoading } = useReservationHistory({
    state: (state || undefined) as ReservationState | undefined,
    page,
    limit,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / limit)) : 1;

  return (
    <div>
      <PageHeader title="Historial" description="Consulta tus reservas anteriores y su estado." />

      <div className="mb-5">
        <Tabs
          tabs={TABS}
          value={state}
          onChange={(v) => {
            setState(v);
            setPage(1);
          }}
        />
      </div>

      {isLoading || !data ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : data.reservations.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="Sin reservas"
            description="No hay reservas que coincidan con este filtro."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.reservations.map((r) => (
              <ReservationCard key={r.id} reservation={r} onClick={() => setSelected(r)} />
            ))}
          </div>

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
        </>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? `Reserva ${selected.code}` : ''}
        size="sm"
      >
        {selected && (
          <div>
            <div className="mb-3 flex items-center justify-end">
              <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', RESERVATION_STATE_CONFIG[selected.state].badge)}>
                {RESERVATION_STATE_CONFIG[selected.state].label}
              </span>
            </div>
            <div className="divide-y divide-line">
              <DetailRow icon={MapPin} label="Espacio" value={selected.spaceCode} />
              <DetailRow icon={Hash} label="Código de acceso" value={selected.accessCode} />
              <DetailRow icon={CalendarClock} label="Llegada" value={fmtDateTime(selected.startAt)} />
              <DetailRow icon={Clock} label="Duración" value={fmtDuration(selected.durationMinutes)} />
              <DetailRow icon={Car} label="Vehículo" value={selected.vehiclePlate ?? 'Sin vehículo'} />
            </div>
            {selected.cancelReason && (
              <p className="mt-3 rounded-lg bg-state-occupied/8 px-3 py-2 text-xs text-state-occupied">
                {selected.cancelReason}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
