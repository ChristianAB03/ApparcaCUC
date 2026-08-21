import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { Statistics } from '@/types';

const AXIS = '#8E8E93';
const GRID = '#E7E7EA';
const BRAND = '#A3161A';
const FOREST = '#078930';
const GOLD = '#C9A227';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E7E7EA',
  fontSize: 12,
  boxShadow: '0 12px 34px -14px rgba(16,24,40,0.22)',
};

export function OccupancyByHourChart({ data }: { data: Statistics['occupancyByHour'] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} interval={1} />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Ocupación']} />
        <Area type="monotone" dataKey="occupancy" stroke={BRAND} strokeWidth={2.5} fill="url(#occGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReservationsByDayChart({ data }: { data: Statistics['reservationsByDay'] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Reservas']} cursor={{ fill: '#A3161A0d' }} />
        <Bar dataKey="reservations" fill={FOREST} radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OccupancyTrendChart({ data }: { data: Statistics['occupancyTrend'] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} unit="%" />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, 'Ocupación']} />
        <Line type="monotone" dataKey="occupancy" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3, fill: GOLD }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MostUsedSpacesChart({ data }: { data: Statistics['mostUsedSpaces'] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 6, right: 12, left: 6, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="space" tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={44} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Reservas']} cursor={{ fill: '#A3161A0d' }} />
        <Bar dataKey="reservations" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={[BRAND, '#B8323A', FOREST, GOLD, '#7A1014', '#595959'][i % 6]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
