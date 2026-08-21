import { IUser } from '../models/User';
import { IParkingSpace } from '../models/ParkingSpace';
import { IReservation } from '../models/Reservation';

/** Public-safe user shape (never exposes passwordHash). */
export function publicUser(u: IUser) {
  return {
    id: u.id as string,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarColor: u.avatarColor,
    program: u.program ?? null,
    phone: u.phone ?? null,
    isDemo: u.isDemo,
    lastLoginAt: u.lastLoginAt ?? null,
    createdAt: u.createdAt,
  };
}

export function serializeSpace(s: IParkingSpace) {
  return {
    id: s.id as string,
    code: s.code,
    zone: s.zone,
    position: s.position,
    type: s.type,
    state: s.state,
    level: s.level,
    note: s.note ?? null,
    sensorId: s.sensorId,
    sensorSimulated: true,
    lastStateChangeAt: s.lastStateChangeAt,
    hasReservation: Boolean(s.currentReservation),
  };
}

export function serializeReservation(r: IReservation) {
  return {
    id: r.id as string,
    code: r.code,
    accessCode: r.accessCode,
    spaceCode: r.spaceCode,
    vehiclePlate: r.vehiclePlate || null,
    startAt: r.startAt,
    endAt: r.endAt,
    durationMinutes: r.durationMinutes,
    state: r.state,
    checkInAt: r.checkInAt ?? null,
    checkOutAt: r.checkOutAt ?? null,
    cancelledAt: r.cancelledAt ?? null,
    cancelReason: r.cancelReason ?? null,
    createdAt: r.createdAt,
  };
}
