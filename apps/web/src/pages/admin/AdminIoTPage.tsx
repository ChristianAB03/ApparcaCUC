import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Cpu, Check, RefreshCw } from 'lucide-react';
import { useAdminSpaces } from '@/hooks/useAdmin';
import { useSetSpaceState } from '@/hooks/useParking';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Field, Input } from '@/components/ui/form';
import { StateBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/feedback';
import { ParkingMap, SpaceLegend } from '@/components/parking/ParkingMap';
import { STATE_CONFIG, PARKING_STATE_ORDER } from '@/config/parking';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { errorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ParkingSpace, ParkingState } from '@/types';

function SensorControl({ space, onClose }: { space: ParkingSpace | null; onClose: () => void }) {
  const setState = useSetSpaceState();
  const [note, setNote] = useState('');

  useEffect(() => {
    setNote(space?.note ?? '');
  }, [space]);

  const apply = async (state: ParkingState) => {
    if (!space) return;
    try {
      await setState.mutateAsync({ id: space.id, state, source: 'sensor', note: note || undefined });
      toast.success(`${space.code} → ${STATE_CONFIG[state].label}`);
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Modal
      open={Boolean(space)}
      onClose={onClose}
      title={space ? `Sensor ${space.code}` : ''}
      description={space ? `${space.sensorId} · Sensor simulado` : undefined}
      size="sm"
    >
      {space && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-surface p-3">
            <span className="font-display text-lg font-bold text-ink">{space.code}</span>
            <StateBadge state={space.state} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Cambiar estado del sensor</p>
            <div className="grid grid-cols-2 gap-2">
              {PARKING_STATE_ORDER.map((st) => {
                const cfg = STATE_CONFIG[st];
                const { Icon } = cfg;
                const isActive = space.state === st;
                return (
                  <button
                    key={st}
                    disabled={setState.isPending}
                    onClick={() => apply(st)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all disabled:opacity-60',
                      isActive ? cfg.badge : 'border-line text-ink-soft hover:bg-surface',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{cfg.label}</span>
                    {isActive && <Check className="ml-auto h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Nota (opcional)">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej. Mantenimiento programado" maxLength={160} />
          </Field>
        </div>
      )}
    </Modal>
  );
}

export default function AdminIoTPage() {
  const { data: spaces, isLoading, isFetching, refetch } = useAdminSpaces();
  const [selected, setSelected] = useState<ParkingSpace | null>(null);

  // Keep the selected space in sync with fresh polling data.
  const liveSelected = selected && spaces ? spaces.find((s) => s.id === selected.id) ?? null : selected;

  const counts = spaces
    ? {
        available: spaces.filter((s) => s.state === 'available').length,
        occupied: spaces.filter((s) => s.state === 'occupied').length,
        reserved: spaces.filter((s) => s.state === 'reserved').length,
        disabled: spaces.filter((s) => s.state === 'disabled').length,
      }
    : null;

  return (
    <div>
      <PageHeader
        title="Simulador de sensores IoT"
        description="Cambia el estado de cualquier espacio para simular la lectura de un sensor."
        badge={<DemoBadge label="Sensores simulados" />}
        actions={
          <button
            onClick={() => refetch()}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-surface"
            aria-label="Actualizar"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </button>
        }
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand/[0.04] p-4">
        <Cpu className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm text-ink-soft">
          Cada espacio representa un <span className="font-medium text-ink">sensor simulado</span>. Al cambiar su
          estado se actualizan el mapa, el panel de usuario, las estadísticas y el registro de auditoría — igual
          que si un sensor físico reportara la ocupación.
        </p>
      </div>

      {counts && (
        <div className="mb-5 grid grid-cols-4 gap-3">
          {(['available', 'reserved', 'occupied', 'disabled'] as const).map((st) => (
            <div key={st} className="card p-3 text-center">
              <p className={cn('font-display text-2xl font-bold', STATE_CONFIG[st].accent)}>{counts[st]}</p>
              <p className="text-xs text-ink-soft">{STATE_CONFIG[st].label}</p>
            </div>
          ))}
        </div>
      )}

      <Card className="p-4 sm:p-5">
        <SpaceLegend className="mb-4" />
        {isLoading || !spaces ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <ParkingMap spaces={spaces} onSelect={setSelected} selectedId={liveSelected?.id} />
        )}
      </Card>

      <SensorControl space={liveSelected} onClose={() => setSelected(null)} />
    </div>
  );
}
