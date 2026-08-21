import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useSpaces } from '@/hooks/useParking';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/feedback';
import { ParkingMap, SpaceLegend } from '@/components/parking/ParkingMap';
import { SpaceDetail } from '@/components/parking/SpaceDetail';
import { ReservationForm } from '@/components/reservations/ReservationForm';
import { DemoBadge } from '@/components/brand/DemoBadge';
import type { ParkingSpace } from '@/types';

const ZONE_TABS = [
  { value: '', label: 'Todas' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

export default function ParkingMapPage() {
  const navigate = useNavigate();
  const [zone, setZone] = useState('');
  const [state, setState] = useState('');
  const [selected, setSelected] = useState<ParkingSpace | null>(null);
  const [reserving, setReserving] = useState<ParkingSpace | null>(null);

  const filters = { zone: zone || undefined, state: state || undefined };
  const { data: spaces, isLoading, isFetching, refetch } = useSpaces(filters);

  return (
    <div>
      <PageHeader
        title="Mapa del parqueadero"
        description="Explora la disponibilidad en tiempo real y reserva un espacio."
        badge={<DemoBadge />}
      />

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs tabs={ZONE_TABS} value={zone} onChange={setZone} />
          <div className="flex items-center gap-2">
            <Select value={state} onChange={(e) => setState(e.target.value)} className="h-10 w-48">
              <option value="">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="occupied">Ocupado</option>
              <option value="disabled">Fuera de servicio</option>
            </Select>
            <button
              onClick={() => refetch()}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-surface"
              aria-label="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <SpaceLegend />
        </div>

        <div className="mt-5">
          {isLoading || !spaces ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : spaces.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-muted">
              No hay espacios que coincidan con los filtros seleccionados.
            </p>
          ) : (
            <ParkingMap spaces={spaces} onSelect={setSelected} selectedId={selected?.id} />
          )}
        </div>
      </Card>

      <SpaceDetail
        space={selected}
        onClose={() => setSelected(null)}
        onReserve={(s) => {
          setSelected(null);
          setReserving(s);
        }}
      />
      <ReservationForm
        space={reserving}
        open={Boolean(reserving)}
        onClose={() => setReserving(null)}
        onSuccess={() => navigate('/app/reservas')}
      />
    </div>
  );
}
