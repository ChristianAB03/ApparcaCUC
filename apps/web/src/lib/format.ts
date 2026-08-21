import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type DateInput = string | number | Date;

export function fmtDate(d: DateInput): string {
  return format(new Date(d), "d 'de' MMM, yyyy", { locale: es });
}

export function fmtDateTime(d: DateInput): string {
  return format(new Date(d), "d MMM yyyy · HH:mm", { locale: es });
}

export function fmtTime(d: DateInput): string {
  return format(new Date(d), 'HH:mm', { locale: es });
}

export function fromNow(d: DateInput): string {
  return formatDistanceToNow(new Date(d), { addSuffix: true, locale: es });
}

export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function fmtPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
