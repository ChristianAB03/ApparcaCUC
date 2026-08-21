import { ParkingSpace } from '../models/ParkingSpace';
import { Reservation } from '../models/Reservation';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { SupportTicket } from '../models/SupportTicket';
import { AuditLog } from '../models/AuditLog';
import { getStateCounts, adminSetSpaceState } from '../services/parking.service';
import { cancelReservation } from '../services/reservation.service';
import { getStatistics } from '../services/stats.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { serializeSpace, serializeReservation, publicUser } from '../utils/serializers';

/* ── Overview ─────────────────────────────────────────────── */
export const overview = asyncHandler(async (_req, res) => {
  const [counts, activeReservations, totalUsers, pendingTickets, recentAudit] = await Promise.all([
    getStateCounts(),
    Reservation.countDocuments({ state: { $in: ['active', 'checked_in'] } }),
    User.countDocuments(),
    SupportTicket.countDocuments({ status: 'pending' }),
    AuditLog.find().sort({ createdAt: -1 }).limit(8),
  ]);
  res.json({ counts, activeReservations, totalUsers, pendingTickets, recentAudit });
});

/* ── Spaces & IoT simulator ───────────────────────────────── */
export const listSpaces = asyncHandler(async (_req, res) => {
  const spaces = await ParkingSpace.find().sort({ zone: 1, position: 1 });
  res.json({ spaces: spaces.map(serializeSpace) });
});

export const createSpace = asyncHandler(async (req, res) => {
  const { zone, position, type, level, state } = req.body;
  const code = `${zone}-${String(position).padStart(2, '0')}`;
  const exists = await ParkingSpace.findOne({ code });
  if (exists) throw ApiError.conflict(`El espacio ${code} ya existe.`);
  const space = await ParkingSpace.create({ code, zone, position, type, level, state, sensorId: `SIM-${code}` });
  res.status(201).json({ space: serializeSpace(space) });
});

export const updateSpace = asyncHandler(async (req, res) => {
  const space = await ParkingSpace.findById(req.params.id);
  if (!space) throw ApiError.notFound('Espacio no encontrado.');
  Object.assign(space, req.body);
  await space.save();
  res.json({ space: serializeSpace(space) });
});

/** IoT simulator / manual override — the "simulated sensor" endpoint. */
export const setSpaceState = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user!.sub).select('name');
  const { state, note, source } = req.body as {
    state: 'available' | 'occupied' | 'reserved' | 'disabled';
    note?: string;
    source: 'admin' | 'sensor';
  };
  const space = await adminSetSpaceState({
    spaceId: req.params.id,
    to: state,
    note,
    source,
    admin: { id: req.user!.sub, name: admin?.name ?? 'Administrador' },
  });
  res.json({ space: serializeSpace(space) });
});

/* ── Reservations ─────────────────────────────────────────── */
export const listReservations = asyncHandler(async (req, res) => {
  const { state, page = 1, limit = 20 } = req.query as { state?: string; page?: number; limit?: number };
  const filter: Record<string, unknown> = {};
  if (state) filter.state = state;

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Reservation.find(filter).populate('user', 'name email avatarColor').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Reservation.countDocuments(filter),
  ]);

  const reservations = items.map((r) => {
    const u = r.user as unknown as { id: string; name: string; email: string; avatarColor: string } | null;
    return {
      ...serializeReservation(r),
      user: u ? { id: u.id, name: u.name, email: u.email, avatarColor: u.avatarColor } : null,
    };
  });
  res.json({ reservations, page: Number(page), limit: Number(limit), total });
});

export const cancelReservationAsAdmin = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user!.sub).select('name');
  const reservation = await cancelReservation({
    reservationId: req.params.id,
    actor: { id: req.user!.sub, name: admin?.name ?? 'Administrador', role: 'admin' },
    reason: (req.body as { reason?: string })?.reason,
  });
  res.json({ reservation: serializeReservation(reservation) });
});

/* ── Users ────────────────────────────────────────────────── */
export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ role: -1, createdAt: 1 });
  const [reservationCounts, vehicleCounts] = await Promise.all([
    Reservation.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: '$user', count: { $sum: 1 } } }]),
    Vehicle.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: '$owner', count: { $sum: 1 } } }]),
  ]);
  const rMap = new Map(reservationCounts.map((r) => [String(r._id), r.count]));
  const vMap = new Map(vehicleCounts.map((v) => [String(v._id), v.count]));

  res.json({
    users: users.map((u) => ({
      ...publicUser(u),
      reservations: rMap.get(u.id as string) ?? 0,
      vehicles: vMap.get(u.id as string) ?? 0,
    })),
  });
});

/* ── Support tickets ──────────────────────────────────────── */
export const listTickets = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query as { status?: string; page?: number; limit?: number };
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    SupportTicket.countDocuments(filter),
  ]);
  res.json({ tickets, page: Number(page), limit: Number(limit), total });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );
  if (!ticket) throw ApiError.notFound('Ticket no encontrado.');
  res.json({ ticket });
});

/* ── Analytics & monitoring ───────────────────────────────── */
export const statistics = asyncHandler(async (_req, res) => {
  res.json(await getStatistics());
});

export const auditLogs = asyncHandler(async (_req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
  res.json({ logs });
});
