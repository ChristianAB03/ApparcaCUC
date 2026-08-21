import { Types } from 'mongoose';
import { Reservation, IReservation } from '../models/Reservation';
import { ParkingSpace } from '../models/ParkingSpace';
import { Vehicle } from '../models/Vehicle';
import { AuditLog } from '../models/AuditLog';
import { nextSeq } from '../models/Counter';
import { reservationCode, accessCode } from '../utils/codes';
import { changeSpaceState } from './parking.service';
import { notify } from './notification.service';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

type Actor = { id: string; name: string; role: 'user' | 'admin' };

/** Creates a reservation, atomically claiming an available space. */
export async function createReservation(opts: {
  userId: string;
  userName: string;
  spaceId: string;
  vehicleId?: string;
  startAt: Date;
  durationMinutes: number;
}): Promise<IReservation> {
  // A user may only hold one active reservation at a time (demo rule).
  const existingActive = await Reservation.findOne({
    user: opts.userId,
    state: { $in: ['active', 'checked_in'] },
  });
  if (existingActive) {
    throw ApiError.conflict('Ya tienes una reserva activa. Cancélala antes de crear otra.');
  }

  // Validate optional vehicle ownership.
  let vehiclePlate = '';
  let vehicleId: Types.ObjectId | undefined;
  if (opts.vehicleId) {
    const vehicle = await Vehicle.findOne({ _id: opts.vehicleId, owner: opts.userId });
    if (!vehicle) throw ApiError.badRequest('El vehículo seleccionado no es válido.');
    vehiclePlate = vehicle.plate;
    vehicleId = vehicle._id;
  }

  // Atomically claim the space only if it is currently available.
  const claimed = await ParkingSpace.findOneAndUpdate(
    { _id: opts.spaceId, state: 'available' },
    { $set: { state: 'reserved', lastStateChangeAt: new Date() } },
    { new: true },
  );
  if (!claimed) {
    const exists = await ParkingSpace.exists({ _id: opts.spaceId });
    if (!exists) throw ApiError.notFound('Espacio no encontrado.');
    throw ApiError.conflict('Ese espacio ya no está disponible. Elige otro.');
  }

  try {
    const start = opts.startAt;
    const end = new Date(start.getTime() + opts.durationMinutes * 60_000);
    const seq = await nextSeq('reservation');
    const code = reservationCode(seq, start.getFullYear());

    const reservation = await Reservation.create({
      code,
      accessCode: accessCode(),
      user: opts.userId,
      space: claimed._id,
      spaceCode: claimed.code,
      vehicle: vehicleId ?? null,
      vehiclePlate,
      startAt: start,
      endAt: end,
      durationMinutes: opts.durationMinutes,
      state: 'active',
    });

    claimed.currentReservation = reservation._id;
    await claimed.save();

    await AuditLog.create({
      actorType: 'user',
      actorLabel: opts.userName,
      action: 'reservation.create',
      target: code,
      to: 'reserved',
      meta: { spaceCode: claimed.code },
    });

    await notify({
      user: opts.userId,
      type: 'reservation',
      title: 'Reserva confirmada',
      message: `Tu reserva ${code} para el espacio ${claimed.code} fue confirmada.`,
      meta: { reservationId: reservation.id, spaceCode: claimed.code, accessCode: reservation.accessCode },
    });

    return reservation;
  } catch (err) {
    // Compensating action: release the space we just claimed.
    await ParkingSpace.updateOne(
      { _id: claimed._id, state: 'reserved' },
      { $set: { state: 'available', currentReservation: null } },
    ).catch(() => undefined);
    throw err;
  }
}

/** Cancels an active reservation and frees its space (owner or admin). */
export async function cancelReservation(opts: {
  reservationId: string;
  actor: Actor;
  reason?: string;
}): Promise<IReservation> {
  const res = await Reservation.findById(opts.reservationId);
  if (!res) throw ApiError.notFound('Reserva no encontrada.');
  if (opts.actor.role !== 'admin' && res.user.toString() !== opts.actor.id) {
    throw ApiError.forbidden('No puedes modificar esta reserva.');
  }
  if (res.state !== 'active' && res.state !== 'checked_in') {
    throw ApiError.conflict('Esta reserva ya no se puede cancelar.');
  }

  res.state = 'cancelled';
  res.cancelledAt = new Date();
  res.cancelReason =
    opts.reason || (opts.actor.role === 'admin' ? 'Cancelada por administración.' : 'Cancelada por el usuario.');
  await res.save();

  // Free the space only if it still belongs to this reservation.
  const space = await ParkingSpace.findOne({ code: res.spaceCode });
  if (space && space.currentReservation?.toString() === res.id) {
    await changeSpaceState({
      spaceId: space.id,
      to: 'available',
      actorType: opts.actor.role,
      actorLabel: opts.actor.name,
      actorId: opts.actor.id,
      meta: { reason: 'reservation.cancel', reservationCode: res.code },
    });
  }

  await AuditLog.create({
    actorType: opts.actor.role,
    actorLabel: opts.actor.name,
    action: 'reservation.cancel',
    target: res.code,
    to: 'cancelled',
  });

  await notify({
    user: res.user,
    type: 'reservation',
    title: 'Reserva cancelada',
    message: `Tu reserva ${res.code} (${res.spaceCode}) fue cancelada.`,
    meta: { reservationId: res.id, spaceCode: res.spaceCode },
  });

  return res;
}

export interface AccessResult {
  action: 'checkin' | 'checkout';
  reservation: IReservation;
  spaceCode: string;
}

/**
 * The access simulator brain. Scanning a code toggles the reservation:
 * an `active` reservation checks IN (space → occupied); a `checked_in`
 * reservation checks OUT (space → available, reservation completed).
 */
export async function processAccessScan(rawCode: string): Promise<AccessResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) throw ApiError.badRequest('Ingresa un código de reserva.');

  const res = await Reservation.findOne({ $or: [{ accessCode: code }, { code }] });
  if (!res) throw ApiError.badRequest('Reserva no válida. Verifica el código.');

  if (res.state === 'active') {
    res.state = 'checked_in';
    res.checkInAt = new Date();
    await res.save();

    const space = await ParkingSpace.findOne({ code: res.spaceCode });
    if (space) {
      await changeSpaceState({
        spaceId: space.id,
        to: 'occupied',
        actorType: 'sensor',
        actorLabel: `Barrera ${space.zone}`,
        meta: { reservationCode: res.code },
      });
      await ParkingSpace.updateOne({ _id: space._id }, { $set: { currentReservation: res._id } });
    }
    await notify({
      user: res.user,
      type: 'access',
      title: 'Acceso autorizado',
      message: `Ingreso registrado en ${res.spaceCode}. ¡Bienvenido!`,
      meta: { reservationId: res.id, spaceCode: res.spaceCode },
    });
    return { action: 'checkin', reservation: res, spaceCode: res.spaceCode };
  }

  if (res.state === 'checked_in') {
    res.state = 'completed';
    res.checkOutAt = new Date();
    await res.save();

    const space = await ParkingSpace.findOne({ code: res.spaceCode });
    if (space && space.currentReservation?.toString() === res.id) {
      await changeSpaceState({
        spaceId: space.id,
        to: 'available',
        actorType: 'sensor',
        actorLabel: `Barrera ${space.zone}`,
        meta: { reservationCode: res.code },
      });
    }
    await notify({
      user: res.user,
      type: 'access',
      title: 'Salida registrada',
      message: `Salida registrada de ${res.spaceCode}. El espacio quedó disponible.`,
      meta: { reservationId: res.id, spaceCode: res.spaceCode },
    });
    return { action: 'checkout', reservation: res, spaceCode: res.spaceCode };
  }

  const labels: Record<string, string> = {
    completed: 'completada',
    cancelled: 'cancelada',
    expired: 'expirada',
  };
  throw ApiError.conflict(`Esta reserva está ${labels[res.state] ?? res.state} y no permite ingreso.`);
}

/** Returns the user's current active/checked-in reservation, if any. */
export async function getActiveReservation(userId: string) {
  return Reservation.findOne({ user: userId, state: { $in: ['active', 'checked_in'] } }).sort({
    createdAt: -1,
  });
}

/**
 * Expires reservations whose window has passed without a check-in and frees
 * their spaces. Runs periodically so the demo self-heals over time.
 */
export async function expireStaleReservations(): Promise<number> {
  const now = new Date();
  const stale = await Reservation.find({ state: 'active', endAt: { $lt: now } }).limit(100);
  let count = 0;
  for (const res of stale) {
    res.state = 'expired';
    await res.save();
    const space = await ParkingSpace.findOne({ code: res.spaceCode });
    if (space && space.currentReservation?.toString() === res.id) {
      await changeSpaceState({
        spaceId: space.id,
        to: 'available',
        actorType: 'system',
        actorLabel: 'Sistema',
        meta: { reason: 'reservation.expired', reservationCode: res.code },
      });
    }
    await notify({
      user: res.user,
      type: 'reservation',
      title: 'Reserva expirada',
      message: `Tu reserva ${res.code} (${res.spaceCode}) expiró sin registrar ingreso.`,
      meta: { reservationId: res.id, spaceCode: res.spaceCode },
    });
    count += 1;
  }
  if (count > 0) logger.debug(`Expired ${count} stale reservation(s).`);
  return count;
}
