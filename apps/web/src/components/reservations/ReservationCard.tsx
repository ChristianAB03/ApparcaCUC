import { type ReactNode } from 'react';
import { Car } from 'lucide-react';
import { RESERVATION_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Reservation } from '@/types';

export function ReservationCard({
  reservation,
  onClick,
  footer,
}: {
  reservation: Reservation;
  onClick?: () => void;
  footer?: ReactNode;
}) {
  const stateConf = RESERVATION_STATE_CONFIG[reservation.state];
  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4',
        onClick && 'cursor-pointer transition-all hover:border-brand/30 hover:shadow-elevated',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 font-display text-sm font-bold text-brand">
            {reservation.spaceCode}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink">{reservation.code}</p>
            <p className="text-xs text-ink-muted">{fmtDateTime(reservation.startAt)}</p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', stateConf.badge)}>
          {stateConf.label}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-soft">
        <span className="inline-flex items-center gap-1.5">
          <Car className="h-3.5 w-3.5" />
          {reservation.vehiclePlate ?? 'Sin vehículo'}
        </span>
        {footer}
      </div>
    </div>
  );
}
