import { Cpu } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StateBadge } from '@/components/ui/Badge';
import { SPACE_TYPE_CONFIG } from '@/config/parking';
import { fromNow } from '@/lib/format';
import type { ParkingSpace } from '@/types';

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

export function SpaceDetail({
  space,
  onClose,
  onReserve,
}: {
  space: ParkingSpace | null;
  onClose: () => void;
  onReserve: (s: ParkingSpace) => void;
}) {
  const typeConf = space ? SPACE_TYPE_CONFIG[space.type] : null;

  return (
    <Modal open={Boolean(space)} onClose={onClose} title={space ? `Espacio ${space.code}` : ''} size="sm">
      {space && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <StateBadge state={space.state} />
            {typeConf && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                <typeConf.Icon className="h-3.5 w-3.5" /> {typeConf.label}
              </span>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3.5 text-sm">
            <Info label="Zona" value={`Zona ${space.zone}`} />
            <Info label="Nivel" value={`Nivel ${space.level}`} />
            <Info label="Tipo" value={typeConf?.label ?? space.type} />
            <Info label="Actualizado" value={fromNow(space.lastStateChangeAt)} />
          </dl>

          {space.note && (
            <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs text-[#846708]">Nota: {space.note}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            <Cpu className="h-3.5 w-3.5" /> {space.sensorId}
            <span className="rounded bg-ink/5 px-1.5 py-0.5 font-medium text-ink-soft">Sensor simulado</span>
          </div>

          {space.state === 'available' ? (
            <Button className="w-full" onClick={() => onReserve(space)}>
              Reservar espacio
            </Button>
          ) : (
            <Button className="w-full" variant="outline" disabled>
              {space.state === 'occupied'
                ? 'Actualmente ocupado'
                : space.state === 'reserved'
                  ? 'Espacio reservado'
                  : 'Fuera de servicio'}
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
