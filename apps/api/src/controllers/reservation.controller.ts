import { Reservation } from '../models/Reservation';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { serializeReservation } from '../utils/serializers';
import {
  createReservation,
  cancelReservation,
  processAccessScan,
  getActiveReservation,
} from '../services/reservation.service';

export const createOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.sub).select('name');
  const { spaceId, vehicleId, startAt, durationMinutes } = req.body;

  const reservation = await createReservation({
    userId: req.user!.sub,
    userName: user?.name ?? req.user!.email,
    spaceId,
    vehicleId,
    startAt,
    durationMinutes,
  });
  res.status(201).json({ reservation: serializeReservation(reservation) });
});

export const listMine = asyncHandler(async (req, res) => {
  const { state, page = 1, limit = 20 } = req.query as {
    state?: string;
    page?: number;
    limit?: number;
  };
  const filter: Record<string, unknown> = { user: req.user!.sub };
  if (state) filter.state = state;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Reservation.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Reservation.countDocuments(filter),
  ]);
  res.json({
    reservations: items.map(serializeReservation),
    page: Number(page),
    limit: Number(limit),
    total,
  });
});

export const getActive = asyncHandler(async (req, res) => {
  const reservation = await getActiveReservation(req.user!.sub);
  res.json({ reservation: reservation ? serializeReservation(reservation) : null });
});

export const getOne = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw ApiError.notFound('Reserva no encontrada.');
  if (req.user!.role !== 'admin' && reservation.user.toString() !== req.user!.sub) {
    throw ApiError.forbidden('No puedes ver esta reserva.');
  }
  res.json({ reservation: serializeReservation(reservation) });
});

export const cancel = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.sub).select('name');
  const reservation = await cancelReservation({
    reservationId: req.params.id,
    actor: { id: req.user!.sub, name: user?.name ?? req.user!.email, role: req.user!.role },
    reason: (req.body as { reason?: string })?.reason,
  });
  res.json({ reservation: serializeReservation(reservation) });
});

export const accessScan = asyncHandler(async (req, res) => {
  const { code } = req.body as { code: string };
  const result = await processAccessScan(code);
  res.json({
    action: result.action,
    spaceCode: result.spaceCode,
    reservation: serializeReservation(result.reservation),
  });
});
