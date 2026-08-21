import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScanLine, XCircle, CalendarPlus, ArrowRight, Info, MapPin, Car, CalendarClock, Clock } from 'lucide-react';
import { useActiveReservation, useCancelReservation } from '@/hooks/useReservations';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { ConfirmDialog } from '@/components/ui/Modal';
import { QRTicket } from '@/components/reservations/QRTicket';
import { RESERVATION_STATE_CONFIG } from '@/config/parking';
import { fmtDateTime, fmtDuration } from '@/lib/format';
import { errorMessage } from '@/lib/api';

function DetailRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 text-ink-muted" />
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="ml-auto text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default function ReservationsPage() {
  const { data: active, isLoading } = useActiveReservation();
  const cancel = useCancelReservation();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const doCancel = async () => {
    if (!active) return;
    try {
      await cancel.mutateAsync(active.id);
      toast.success('Reserva cancelada');
      setConfirm(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div>
      <PageHeader title="Mis reservas" description="Tu reserva activa y su pase de acceso." />

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : !active ? (
        <Card className="p-6">
          <EmptyState
            icon={<CalendarPlus className="h-6 w-6" />}
            title="No tienes una reserva activa"
            description="Consulta el mapa del parqueadero y reserva un espacio disponible para generar tu pase de acceso."
            action={
              <Button onClick={() => navigate('/app/mapa')}>
                Ir al mapa <ArrowRight className="h-4 w-4" />
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <QRTicket reservation={active} />
          </div>

          <div className="space-y-4">
            <Card>
              <div className="border-b border-line p-5">
                <SectionHeading
                  title="Detalle de la reserva"
                  action={
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${RESERVATION_STATE_CONFIG[active.state].badge}`}
                    >
                      {RESERVATION_STATE_CONFIG[active.state].label}
                    </span>
                  }
                />
              </div>
              <div className="divide-y divide-line px-5 py-1">
                <DetailRow icon={MapPin} label="Espacio" value={active.spaceCode} />
                <DetailRow icon={CalendarClock} label="Llegada" value={fmtDateTime(active.startAt)} />
                <DetailRow icon={Clock} label="Duración" value={fmtDuration(active.durationMinutes)} />
                <DetailRow icon={Car} label="Vehículo" value={active.vehiclePlate ?? 'Sin vehículo'} />
              </div>
              <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row">
                <Link to="/app/acceso" className="flex-1">
                  <Button className="w-full">
                    <ScanLine className="h-4 w-4" /> Simular ingreso
                  </Button>
                </Link>
                <Button variant="outline" className="flex-1" onClick={() => setConfirm(true)}>
                  <XCircle className="h-4 w-4" /> Cancelar reserva
                </Button>
              </div>
            </Card>

            <div className="flex items-start gap-3 rounded-xl border border-line bg-card p-4 text-sm text-ink-soft">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <p>
                Presenta el código <span className="font-semibold text-ink">{active.accessCode}</span> en el{' '}
                <Link to="/app/acceso" className="font-medium text-brand hover:underline">
                  simulador de acceso
                </Link>{' '}
                para registrar tu ingreso y salida. La validación es simulada.
              </p>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={doCancel}
        loading={cancel.isPending}
        title="Cancelar reserva"
        description={
          active ? `¿Seguro que deseas cancelar la reserva ${active.code} del espacio ${active.spaceCode}?` : ''
        }
        confirmLabel="Sí, cancelar"
        cancelLabel="No, mantener"
      />
    </div>
  );
}
