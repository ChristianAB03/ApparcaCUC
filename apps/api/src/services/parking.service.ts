import { Types } from 'mongoose';
import { ParkingSpace } from '../models/ParkingSpace';
import { Reservation } from '../models/Reservation';
import { AuditLog, ActorType } from '../models/AuditLog';
import { ParkingState } from '../constants';
import { ApiError } from '../utils/apiError';
import { notify } from './notification.service';

export interface StateCounts {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  disabled: number;
  /** Busy ratio among in-service spaces (0..1). */
  occupancyRate: number;
}

export async function getStateCounts(): Promise<StateCounts> {
  const rows = await ParkingSpace.aggregate<{ _id: ParkingState; count: number }>([
    { $group: { _id: '$state', count: { $sum: 1 } } },
  ]);
  const counts = { available: 0, occupied: 0, reserved: 0, disabled: 0 };
  for (const r of rows) counts[r._id] = r.count;
  const total = counts.available + counts.occupied + counts.reserved + counts.disabled;
  const inService = total - counts.disabled;
  const busy = counts.occupied + counts.reserved;
  return { total, ...counts, occupancyRate: inService > 0 ? busy / inService : 0 };
}

/**
 * Low-level state transition for a single space. Records an audit entry so the
 * IoT simulator, admin actions and system events all leave a consistent trail.
 * Clears the reservation link when the space becomes free or out of service.
 */
export async function changeSpaceState(opts: {
  spaceId?: string;
  spaceCode?: string;
  to: ParkingState;
  actorType: ActorType;
  actorLabel: string;
  actorId?: Types.ObjectId | string | null;
  note?: string;
  meta?: Record<string, unknown>;
}) {
  const query = opts.spaceId ? { _id: opts.spaceId } : { code: opts.spaceCode };
  const space = await ParkingSpace.findOne(query);
  if (!space) throw ApiError.notFound('Espacio no encontrado.');

  const from = space.state;
  space.state = opts.to;
  space.lastStateChangeAt = new Date();
  if (opts.note !== undefined) space.note = opts.note;
  if (opts.to === 'available' || opts.to === 'disabled') {
    space.currentReservation = null;
  }
  await space.save();

  await AuditLog.create({
    actor: opts.actorId ?? null,
    actorType: opts.actorType,
    actorLabel: opts.actorLabel,
    action: 'space.state_change',
    target: space.code,
    from,
    to: opts.to,
    meta: opts.meta,
  });

  return space;
}

/**
 * High-level state change used by the admin panel / IoT simulator.
 * If a space that holds an active reservation is freed or disabled, the linked
 * reservation is resolved and the owner is notified — keeping dashboard, map,
 * stats and history all consistent. This is what makes the "simulated sensor"
 * behave like a real one would.
 */
export async function adminSetSpaceState(opts: {
  spaceId: string;
  to: ParkingState;
  note?: string;
  source: 'admin' | 'sensor';
  admin: { id: string; name: string };
}) {
  const space = await ParkingSpace.findById(opts.spaceId);
  if (!space) throw ApiError.notFound('Espacio no encontrado.');

  if ((opts.to === 'available' || opts.to === 'disabled') && space.currentReservation) {
    const res = await Reservation.findById(space.currentReservation);
    if (res && (res.state === 'active' || res.state === 'checked_in')) {
      const wasCheckedIn = res.state === 'checked_in';
      res.state = wasCheckedIn ? 'completed' : 'cancelled';
      if (wasCheckedIn) res.checkOutAt = new Date();
      else {
        res.cancelledAt = new Date();
        res.cancelReason = `Espacio liberado por ${opts.source === 'sensor' ? 'sensor' : 'administración'}.`;
      }
      await res.save();
      await notify({
        user: res.user,
        type: 'space',
        title: `Espacio ${space.code} liberado`,
        message: `El espacio ${space.code} fue liberado${
          opts.source === 'sensor' ? ' por el sensor' : ''
        }. Tu reserva ${res.code} se cerró.`,
        meta: { reservationId: res.id, spaceCode: space.code },
      });
    }
  }

  const actorLabel = opts.source === 'sensor' ? `Sensor ${space.sensorId}` : opts.admin.name;
  return changeSpaceState({
    spaceId: space.id,
    to: opts.to,
    actorType: opts.source,
    actorLabel,
    actorId: opts.source === 'admin' ? opts.admin.id : null,
    note: opts.note,
    meta: { from: space.state, source: opts.source },
  });
}
