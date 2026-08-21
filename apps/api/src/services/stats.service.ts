import { Reservation } from '../models/Reservation';
import { getStateCounts } from './parking.service';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Smooth two-peak curve (mid-morning + mid-afternoon). Returns a percentage. */
function simulatedHourlyOccupancy(h: number): number {
  const morning = Math.exp(-((h - 10) ** 2) / 8);
  const afternoon = Math.exp(-((h - 16) ** 2) / 10);
  const base = 0.22 + 0.68 * Math.max(morning, afternoon);
  return Math.round(Math.min(0.98, base) * 100);
}

const DAILY_TREND = [58, 71, 83, 76, 89, 44, 28];

/**
 * Builds the analytics payload. Reservation counts come from real seeded/created
 * data; hourly occupancy and the daily trend are SIMULATED (there is no historic
 * occupancy log in this demo) and flagged with `simulated: true`.
 */
export async function getStatistics() {
  const stateCounts = await getStateCounts();

  const since = new Date();
  since.setDate(since.getDate() - 6);
  since.setHours(0, 0, 0, 0);

  const perDayRaw = await Reservation.aggregate<{ _id: string; count: number }>([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
  ]);
  const perDayMap = new Map(perDayRaw.map((r) => [r._id, r.count]));

  const reservationsByDay: { date: string; label: string; reservations: number }[] = [];
  const occupancyTrend: { date: string; label: string; occupancy: number }[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = dayKey(d);
    reservationsByDay.push({ date: key, label: DAY_LABELS[d.getDay()], reservations: perDayMap.get(key) ?? 0 });
    occupancyTrend.push({ date: key, label: DAY_LABELS[d.getDay()], occupancy: DAILY_TREND[6 - i] });
  }

  const occupancyByHour: { hour: string; occupancy: number }[] = [];
  for (let h = 6; h <= 21; h += 1) {
    occupancyByHour.push({ hour: `${String(h).padStart(2, '0')}:00`, occupancy: simulatedHourlyOccupancy(h) });
  }

  const topSpacesRaw = await Reservation.aggregate<{ _id: string; count: number }>([
    { $group: { _id: '$spaceCode', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);
  const mostUsedSpaces = topSpacesRaw.map((r) => ({ space: r._id, reservations: r.count }));

  const totalReservations = await Reservation.countDocuments();
  const completed = await Reservation.countDocuments({ state: 'completed' });

  return {
    simulated: true,
    generatedAt: new Date().toISOString(),
    stateCounts,
    totals: { reservations: totalReservations, completed },
    reservationsByDay,
    occupancyByHour,
    occupancyTrend,
    mostUsedSpaces,
  };
}
