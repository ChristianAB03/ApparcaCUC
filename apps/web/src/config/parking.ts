import {
  CheckCircle2,
  Clock,
  CarFront,
  Wrench,
  Accessibility,
  Zap,
  Bike,
  Users,
  Car,
  Package,
  type LucideIcon,
} from 'lucide-react';
import type { ParkingState, SpaceType, ReservationState, TicketState } from '@/types';

interface StateStyle {
  label: string;
  Icon: LucideIcon;
  /** Small color dot. */
  dot: string;
  /** Chip / badge styling. */
  badge: string;
  /** Map cell (tinted) styling. */
  cell: string;
  /** Solid fill (legend key, strong emphasis). */
  solid: string;
  /** Text/icon accent color. */
  accent: string;
}

export const STATE_CONFIG: Record<ParkingState, StateStyle> = {
  available: {
    label: 'Disponible',
    Icon: CheckCircle2,
    dot: 'bg-state-available',
    badge: 'bg-state-available/12 text-state-available ring-1 ring-inset ring-state-available/25',
    cell: 'bg-state-available/10 border-state-available/35 text-state-available hover:bg-state-available/20',
    solid: 'bg-state-available text-white',
    accent: 'text-state-available',
  },
  reserved: {
    label: 'Reservado',
    Icon: Clock,
    dot: 'bg-gold-bright',
    badge: 'bg-gold/15 text-[#846708] ring-1 ring-inset ring-gold/40',
    cell: 'bg-gold/15 border-gold/45 text-[#846708] hover:bg-gold/25',
    solid: 'bg-gold-bright text-ink',
    accent: 'text-[#846708]',
  },
  occupied: {
    label: 'Ocupado',
    Icon: CarFront,
    dot: 'bg-state-occupied',
    badge: 'bg-state-occupied/12 text-state-occupied ring-1 ring-inset ring-state-occupied/25',
    cell: 'bg-state-occupied/10 border-state-occupied/35 text-state-occupied hover:bg-state-occupied/20',
    solid: 'bg-state-occupied text-white',
    accent: 'text-state-occupied',
  },
  disabled: {
    label: 'Fuera de servicio',
    Icon: Wrench,
    dot: 'bg-state-disabled',
    badge: 'bg-state-disabled/12 text-state-disabled ring-1 ring-inset ring-state-disabled/25',
    cell: 'bg-state-disabled/12 border-state-disabled/35 text-state-disabled hover:bg-state-disabled/20',
    solid: 'bg-state-disabled text-white',
    accent: 'text-state-disabled',
  },
};

export const PARKING_STATE_ORDER: ParkingState[] = ['available', 'reserved', 'occupied', 'disabled'];

export const SPACE_TYPE_CONFIG: Record<SpaceType, { label: string; Icon: LucideIcon }> = {
  standard: { label: 'Estándar', Icon: Car },
  compact: { label: 'Compacto', Icon: Package },
  accessible: { label: 'Accesible', Icon: Accessibility },
  ev: { label: 'Eléctrico', Icon: Zap },
  motorcycle: { label: 'Motocicleta', Icon: Bike },
  visitor: { label: 'Visitante', Icon: Users },
};

export const RESERVATION_STATE_CONFIG: Record<ReservationState, { label: string; badge: string }> = {
  active: { label: 'Activa', badge: 'bg-forest/12 text-forest ring-1 ring-inset ring-forest/25' },
  checked_in: { label: 'En curso', badge: 'bg-brand/10 text-brand ring-1 ring-inset ring-brand/20' },
  completed: { label: 'Completada', badge: 'bg-state-disabled/12 text-ink-soft ring-1 ring-inset ring-line' },
  cancelled: { label: 'Cancelada', badge: 'bg-state-occupied/10 text-state-occupied ring-1 ring-inset ring-state-occupied/20' },
  expired: { label: 'Expirada', badge: 'bg-gold/15 text-[#846708] ring-1 ring-inset ring-gold/30' },
};

export const TICKET_STATE_CONFIG: Record<TicketState, { label: string; badge: string }> = {
  pending: { label: 'Pendiente', badge: 'bg-gold/15 text-[#846708] ring-1 ring-inset ring-gold/30' },
  in_review: { label: 'En revisión', badge: 'bg-brand/10 text-brand ring-1 ring-inset ring-brand/20' },
  resolved: { label: 'Resuelto', badge: 'bg-forest/12 text-forest ring-1 ring-inset ring-forest/25' },
};

export const TICKET_CATEGORY_LABELS: Record<string, string> = {
  reservation: 'Problema con reserva',
  occupied_space: 'Espacio ocupado incorrectamente',
  qr: 'Problema con QR',
  access: 'Problema de acceso',
  other: 'Otro',
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  car: 'Automóvil',
  suv: 'Camioneta / SUV',
  motorcycle: 'Motocicleta',
  ev: 'Vehículo eléctrico',
  bicycle: 'Bicicleta',
};
