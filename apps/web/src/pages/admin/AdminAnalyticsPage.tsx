import { Clock, CalendarDays, TrendingUp, Trophy, Info } from 'lucide-react';
import { useStatistics } from '@/hooks/useAdmin';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, SectionHeading } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/feedback';
import { DemoBadge } from '@/components/brand/DemoBadge';
import {
  OccupancyByHourChart,
  ReservationsByDayChart,
  OccupancyTrendChart,
  MostUsedSpacesChart,
} from '@/components/charts/AnalyticsCharts';

function ChartCard({
  title,
  description,
  icon,
  simulated,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  simulated?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <SectionHeading
        title={title}
        description={description}
        icon={icon}
        action={
          simulated ? (
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.68rem] font-medium text-[#846708]">
              Datos simulados
            </span>
          ) : undefined
        }
      />
      <div className="mt-4">{children}</div>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useStatistics();

  return (
    <div>
      <PageHeader
        title="Analíticas"
        description="Métricas de ocupación y uso del estacionamiento."
        badge={<DemoBadge label="Datos simulados" />}
      />

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-line bg-card p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
        <p className="text-sm text-ink-soft">
          Las reservas por día provienen de datos reales de la demo; la ocupación por hora y la tendencia son{' '}
          <span className="font-medium text-ink">simuladas</span> con fines ilustrativos. No representan
          estadísticas oficiales de ninguna institución.
        </p>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="Ocupación por hora" description="Promedio del día" icon={<Clock className="h-4 w-4" />} simulated>
            <OccupancyByHourChart data={data.occupancyByHour} />
          </ChartCard>
          <ChartCard title="Reservas por día" description="Últimos 7 días" icon={<CalendarDays className="h-4 w-4" />}>
            <ReservationsByDayChart data={data.reservationsByDay} />
          </ChartCard>
          <ChartCard title="Tendencia de ocupación" description="Últimos 7 días" icon={<TrendingUp className="h-4 w-4" />} simulated>
            <OccupancyTrendChart data={data.occupancyTrend} />
          </ChartCard>
          <ChartCard title="Espacios más utilizados" description="Por número de reservas" icon={<Trophy className="h-4 w-4" />}>
            {data.mostUsedSpaces.length > 0 ? (
              <MostUsedSpacesChart data={data.mostUsedSpaces} />
            ) : (
              <p className="py-16 text-center text-sm text-ink-muted">Aún no hay datos suficientes.</p>
            )}
          </ChartCard>
        </div>
      )}
    </div>
  );
}
