import { useMemo } from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { STATE_CONFIG } from '@/config/parking';
import { cn } from '@/lib/utils';
import type { ParkingSpace, ParkingZone } from '@/types';

function SpaceCell({
  space,
  onSelect,
  selected,
}: {
  space: ParkingSpace;
  onSelect: (s: ParkingSpace) => void;
  selected: boolean;
}) {
  const config = STATE_CONFIG[space.state];
  const { Icon } = config;
  return (
    <button
      onClick={() => onSelect(space)}
      aria-label={`Espacio ${space.code}, ${config.label}`}
      title={`${space.code} · ${config.label}`}
      className={cn(
        'relative flex h-14 flex-col items-center justify-center rounded-lg border text-[0.72rem] font-semibold transition-all duration-150',
        config.cell,
        selected && 'ring-2 ring-brand ring-offset-1 ring-offset-surface',
      )}
    >
      <Icon className="h-3.5 w-3.5 opacity-80" aria-hidden />
      <span className="mt-0.5 tabular-nums">{space.code}</span>
      {space.type !== 'standard' && (
        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-current opacity-45" />
      )}
    </button>
  );
}

function ZoneBlock({
  zone,
  spaces,
  onSelect,
  selectedId,
}: {
  zone: ParkingZone;
  spaces: ParkingSpace[];
  onSelect: (s: ParkingSpace) => void;
  selectedId?: string;
}) {
  const available = spaces.filter((s) => s.state === 'available').length;
  return (
    <div className="rounded-xl border border-line bg-surface/60 p-3">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
          {zone}
        </span>
        <span className="text-sm font-semibold text-ink">Zona {zone}</span>
        <span className="ml-auto text-xs font-medium text-ink-muted">
          {available}/{spaces.length} libres
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(3.1rem,1fr))] gap-2">
        {spaces.map((s) => (
          <SpaceCell key={s.id} space={s} onSelect={onSelect} selected={s.id === selectedId} />
        ))}
      </div>
    </div>
  );
}

export function ParkingMap({
  spaces,
  onSelect,
  selectedId,
}: {
  spaces: ParkingSpace[];
  onSelect: (s: ParkingSpace) => void;
  selectedId?: string;
}) {
  const zones = useMemo(() => {
    const grouped: Record<string, ParkingSpace[]> = {};
    for (const s of spaces) {
      (grouped[s.zone] ??= []).push(s);
    }
    return (Object.keys(grouped).sort() as ParkingZone[]).map((zone) => ({
      zone,
      spaces: grouped[zone].sort((a, b) => a.position - b.position),
    }));
  }, [spaces]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-dashed border-line bg-card px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <LogIn className="h-4 w-4 text-forest" /> Entrada
        </span>
        <span className="hidden text-ink-muted/70 sm:inline">Vía interna</span>
        <span className="inline-flex items-center gap-1.5">
          Salida <LogOut className="h-4 w-4 text-brand" />
        </span>
      </div>

      {zones.map(({ zone, spaces: zoneSpaces }) => (
        <ZoneBlock key={zone} zone={zone} spaces={zoneSpaces} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}

export function SpaceLegend({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      {(['available', 'reserved', 'occupied', 'disabled'] as const).map((state) => {
        const config = STATE_CONFIG[state];
        const { Icon } = config;
        return (
          <span key={state} className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
            <span className={cn('flex h-4 w-4 items-center justify-center rounded', config.badge)}>
              <Icon className="h-3 w-3" />
            </span>
            {config.label}
          </span>
        );
      })}
    </div>
  );
}
