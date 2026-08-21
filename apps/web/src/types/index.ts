export type Role = 'user' | 'admin';
export type ParkingState = 'available' | 'occupied' | 'reserved' | 'disabled';
export type SpaceType = 'standard' | 'compact' | 'accessible' | 'ev' | 'motorcycle' | 'visitor';
export type ReservationState = 'active' | 'checked_in' | 'completed' | 'cancelled' | 'expired';
export type VehicleType = 'car' | 'suv' | 'motorcycle' | 'ev' | 'bicycle';
export type TicketCategory = 'reservation' | 'occupied_space' | 'qr' | 'access' | 'other';
export type TicketState = 'pending' | 'in_review' | 'resolved';
export type NotificationType = 'reservation' | 'space' | 'system' | 'access';
export type ParkingZone = 'A' | 'B' | 'C' | 'D';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  program: string | null;
  phone: string | null;
  isDemo: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ParkingSpace {
  id: string;
  code: string;
  zone: ParkingZone;
  position: number;
  type: SpaceType;
  state: ParkingState;
  level: number;
  note: string | null;
  sensorId: string;
  sensorSimulated: boolean;
  lastStateChangeAt: string;
  hasReservation: boolean;
}

export interface StateCounts {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  disabled: number;
  occupancyRate: number;
}

export interface Vehicle {
  id: string;
  owner: string;
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationUser {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
}

export interface Reservation {
  id: string;
  code: string;
  accessCode: string;
  spaceCode: string;
  vehiclePlate: string | null;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  state: ReservationState;
  checkInAt: string | null;
  checkOutAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  user?: ReservationUser | null;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  meta?: Record<string, unknown>;
}

export interface SupportTicket {
  id: string;
  code: string;
  userName: string;
  userEmail: string;
  category: TicketCategory;
  subject: string;
  message: string;
  reference?: string;
  status: TicketState;
  adminNote?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorType: 'admin' | 'sensor' | 'user' | 'system';
  actorLabel: string;
  action: string;
  target: string;
  from?: string;
  to?: string;
  createdAt: string;
}

export interface Statistics {
  simulated: boolean;
  generatedAt: string;
  stateCounts: StateCounts;
  totals: { reservations: number; completed: number };
  reservationsByDay: { date: string; label: string; reservations: number }[];
  occupancyByHour: { hour: string; occupancy: number }[];
  occupancyTrend: { date: string; label: string; occupancy: number }[];
  mostUsedSpaces: { space: string; reservations: number }[];
}

export interface AdminOverview {
  counts: StateCounts;
  activeReservations: number;
  totalUsers: number;
  pendingTickets: number;
  recentAudit: AuditLog[];
}

export interface AdminUser extends User {
  reservations: number;
  vehicles: number;
}
