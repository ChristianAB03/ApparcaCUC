import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  CheckCircle2,
  CarFront,
  Clock,
  Wrench,
  Users,
  LifeBuoy,
  Cpu,
  ShieldCheck,
  User as UserIcon,
  Settings,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useAdminOverview } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/feedback';
import { OccupancyRing } from '@/components/ui/Meter';
import { DemoBadge } from '@/components/brand/DemoBadge';
import { fromNow } from '@/lib/format';
import { fmtPercent } from '@/lib/format';
import type { AuditLog } from '@/types';

const ACTOR_ICON: Record<string, LucideIcon> = {
  sensor: Cpu,
  admin: ShieldCheck,
  user: UserIcon,
  system: Settings,
};

function actionLabel(action: string): string {
  return (
    {
      'space.state_change': 'Cambio de estado',
      'reservation.create': 'Reserva creada',
      'reservation.cancel': 'Reserva cancelada',
      'reservation.expired': 'Reserva expirada',
    }[action] ?? action
  );
}

function AuditRow({ log }: { log: AuditLog }) {
  const Icon = ACTOR_ICON[log.actorType] ?? Settings;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-ink-soft">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">
          {actionLabel(log.action)} · <span className="text-brand">{log.target}</span>
        </p>
        <p className="truncate text-xs text-ink-muted">
          {log.actorLabel}
          {log.from && log.to ? ` · ${log.from} → ${log.to}` : ''}
        </p>
      </div>
      <span className="shrink-0 text-xs text-ink-muted">{fromNow(log.createdAt)}</span>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="font-display text-lg font-bold leading-none text-ink">{value}</p>
        <p className="mt-0.5 text-xs text-ink-soft">{label}</p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview();
  const c = data?.counts;

  return (
    <div>
      <PageHeader
        title="Resumen del estacionamiento"
        description="Estado general y actividad reciente del sistema."
        badge={<DemoBadge />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading || !c ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[104px] rounded-2xl" />)
        ) : (
          <>
            <StatCard label="Total de espacios" value={c.total} tone="brand" icon={<LayoutGrid className="h-5 w-5" />} />
            <StatCard label="Disponibles" value={c.available} tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
            <StatCard label="Ocupados" value={c.occupied} tone="red" icon={<CarFront className="h-5 w-5" />} />
            <StatCard label="Reservados" value={c.reserved} tone="gold" icon={<Clock className="h-5 w-5" />} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5">
          <SectionHeading title="Ocupación" description="Entre espacios en servicio" />
          <div className="mt-4 flex flex-col items-center gap-5">
            <OccupancyRing value={c?.occupancyRate ?? 0} label="ocupado" />
            <div className="grid w-full grid-cols-2 gap-2.5">
              <MiniStat icon={Wrench} label="Fuera de servicio" value={c?.disabled ?? '–'} />
              <MiniStat icon={Clock} label="% Ocupación" value={c ? fmtPercent(c.occupancyRate) : '–'} />
              <MiniStat icon={CarFront} label="Reservas activas" value={data?.activeReservations ?? '–'} />
              <MiniStat icon={Users} label="Usuarios" value={data?.totalUsers ?? '–'} />
            </div>
            <Link to="/admin/iot" className="w-full">
              <Button variant="outline" className="w-full">
                <Cpu className="h-4 w-4" /> Abrir simulador IoT
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line p-5">
            <SectionHeading title="Actividad reciente" description="Eventos de sensores y reservas" />
            {(data?.pendingTickets ?? 0) > 0 && (
              <Link to="/admin/soporte">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-[#846708]">
                  <LifeBuoy className="h-3.5 w-3.5" /> {data?.pendingTickets} tickets pendientes
                </span>
              </Link>
            )}
          </div>
          <div className="divide-y divide-line px-5">
            {isLoading || !data ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="my-3 h-12 rounded-xl" />)
            ) : data.recentAudit.length === 0 ? (
              <EmptyState className="my-4 border-0" title="Sin actividad" description="Aún no hay eventos registrados." />
            ) : (
              data.recentAudit.map((log) => <AuditRow key={log.id} log={log} />)
            )}
          </div>
          <div className="border-t border-line p-4">
            <Link to="/admin/analiticas">
              <Button variant="ghost" size="sm">
                Ver analíticas <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
