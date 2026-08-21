import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  CarFront,
  Clock,
  Wrench,
  Map,
  ScanLine,
  Car,
  ArrowRight,
  QrCode,
  CalendarPlus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useOverview } from '@/hooks/useParking';
import { useActiveReservation, useReservationHistory } from '@/hooks/useReservations';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { OccupancyRing } from '@/components/ui/Meter';
import { StateBadge } from '@/components/ui/Badge';
import { ReservationCard } from '@/components/reservations/ReservationCard';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { fmtDateTime } from '@/lib/format';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const QUICK_ACTIONS = [
  { to: '/app/mapa', label: 'Ver mapa', icon: Map },
  { to: '/app/acceso', label: 'Simular acceso', icon: ScanLine },
  { to: '/app/vehiculos', label: 'Mis vehículos', icon: Car },
  { to: '/app/reservas', label: 'Mis reservas', icon: QrCode },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: counts, isLoading } = useOverview();
  const { data: active } = useActiveReservation();
  const { data: history } = useReservationHistory({ limit: 4 });

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${firstName} 👋`}
        description="Este es el estado del estacionamiento en este momento."
        badge={<DemoBadge />}
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading || !counts ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Disponibles" value={counts.available} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Ocupados" value={counts.occupied} tone="red" icon={<CarFront className="h-5 w-5" />} />
            <StatCard label="Reservados" value={counts.reserved} tone="gold" icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Fuera de servicio" value={counts.disabled} tone="gray" icon={<Wrench className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="border-b border-line p-5">
              <SectionHeading
                title="Mi reserva actual"
                icon={<QrCode className="h-4 w-4" />}
                action={
                  active && (
                    <Link to="/app/reservas">
                      <Button size="sm" variant="outline">
                        Ver detalle <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  )
                }
              />
            </div>
            <div className="p-5">
              {active ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 font-display text-xl font-bold text-brand">
                      {active.spaceCode}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink">{active.code}</p>
                        <StateBadge state="reserved" size="sm" />
                      </div>
                      <p className="mt-0.5 text-sm text-ink-soft">{fmtDateTime(active.startAt)}</p>
                      <p className="text-xs text-ink-muted">
                        Código de acceso: <span className="font-semibold tracking-wider text-ink">{active.accessCode}</span>
                      </p>
                    </div>
                  </div>
                  <Link to="/app/acceso">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <ScanLine className="h-4 w-4" /> Simular ingreso
                    </Button>
                  </Link>
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarPlus className="h-6 w-6" />}
                  title="No tienes una reserva activa"
                  description="Consulta el mapa del parqueadero y reserva un espacio disponible."
                  action={
                    <Button onClick={() => navigate('/app/mapa')}>
                      Reservar ahora <ArrowRight className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
          </Card>

          <Card>
            <div className="border-b border-line p-5">
              <SectionHeading
                title="Actividad reciente"
                description="Tus últimas reservas"
                action={
                  <Link to="/app/historial">
                    <Button size="sm" variant="ghost">
                      Ver historial
                    </Button>
                  </Link>
                }
              />
            </div>
            <div className="space-y-3 p-5">
              {!history ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
              ) : history.reservations.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-muted">Aún no tienes reservas registradas.</p>
              ) : (
                history.reservations.map((r) => (
                  <ReservationCard key={r.id} reservation={r} onClick={() => navigate('/app/historial')} />
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card className="p-5">
            <SectionHeading title="Ocupación general" />
            <div className="mt-4 flex flex-col items-center gap-4">
              <OccupancyRing value={counts?.occupancyRate ?? 0} label="ocupado" />
              <div className="grid w-full grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-state-available/10 p-3">
                  <p className="font-display text-lg font-bold text-state-available">{counts?.available ?? '–'}</p>
                  <p className="text-xs text-ink-soft">Libres</p>
                </div>
                <div className="rounded-xl bg-brand/8 p-3">
                  <p className="font-display text-lg font-bold text-brand">{counts?.total ?? '–'}</p>
                  <p className="text-xs text-ink-soft">Totales</p>
                </div>
              </div>
              <p className="text-center text-[0.7rem] text-ink-muted">
                Actualizado por sensores simulados
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeading title="Accesos rápidos" />
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {QUICK_ACTIONS.map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex flex-col items-center gap-2 rounded-xl border border-line p-4 text-center transition-all hover:border-brand/30 hover:bg-brand/[0.03]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <a.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-ink">{a.label}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
