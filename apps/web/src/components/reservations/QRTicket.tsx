import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Car, CalendarClock, Clock, type LucideIcon } from 'lucide-react';
import { RESERVATION_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime, fmtDuration } from '@/lib/format';

function TicketRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" />
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="truncate font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

export function QRTicket({ reservation }: { reservation: import('@/types').Reservation }) {
  const stateConf = RESERVATION_STATE_CONFIG[reservation.state];
  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <div className="brand-gradient px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-semibold uppercase tracking-wide opacity-90">
            Pase de acceso
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-medium">{stateConf.label}</span>
        </div>
        <p className="mt-1 font-display text-2xl font-bold">{reservation.spaceCode}</p>
        <p className="text-xs opacity-80">Reserva {reservation.code}</p>
      </div>

      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <div className="rounded-xl border border-line bg-white p-3">
          <QRCodeSVG value={reservation.accessCode} size={168} fgColor="#1A1919" level="M" />
        </div>
        <p className="text-xs text-ink-muted">Código de acceso</p>
        <p className="font-display text-2xl font-bold tracking-[0.3em] text-ink">{reservation.accessCode}</p>
      </div>

      <dl className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4 text-sm">
        <TicketRow icon={CalendarClock} label="Llegada" value={fmtDateTime(reservation.startAt)} />
        <TicketRow icon={Clock} label="Duración" value={fmtDuration(reservation.durationMinutes)} />
        <TicketRow icon={Car} label="Vehículo" value={reservation.vehiclePlate ?? '—'} />
        <TicketRow icon={MapPin} label="Zona" value={`Zona ${reservation.spaceCode.split('-')[0]}`} />
      </dl>

      <p className="border-t border-line bg-surface px-5 py-2.5 text-center text-[0.68rem] text-ink-muted">
        Validación simulada · no corresponde a una barrera física real.
      </p>
    </div>
  );
}
