import { connectDatabase, disconnectDatabase } from '../config/db';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { User, hashPassword, IUser } from '../models/User';
import { Vehicle, IVehicle } from '../models/Vehicle';
import { ParkingSpace } from '../models/ParkingSpace';
import { Reservation } from '../models/Reservation';
import { Notification } from '../models/Notification';
import { SupportTicket } from '../models/SupportTicket';
import { AuditLog } from '../models/AuditLog';
import { Counter } from '../models/Counter';
import type { InsertManyOptions } from 'mongoose';
import { reservationCode, accessCode } from '../utils/codes';
import { VehicleType, ParkingState, ParkingZone, SpaceType } from '../constants';

// Mongoose supports `timestamps` at runtime but its InsertManyOptions type omits it.
const NO_TIMESTAMPS = { timestamps: false } as unknown as InsertManyOptions;
import {
  DEMO_PEOPLE,
  VEHICLE_POOL,
  VEHICLE_COLORS,
  ZONE_LAYOUT,
  spaceTypeFor,
  TICKET_TEMPLATES,
} from './data';

const AVATAR_COLORS = ['#A3161A', '#078930', '#C9A227', '#595959', '#7A1014', '#B0641C'];
const PLATE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const PLATE_DIGITS = '0123456789';

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];
const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

function daysAgo(d: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(randInt(7, 20), randInt(0, 59), 0, 0);
  return date;
}

function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.');
}

function randomPlate(type: VehicleType): string {
  const letters = () => Array.from({ length: 3 }, () => pick([...PLATE_LETTERS])).join('');
  const digits = (n: number) => Array.from({ length: n }, () => pick([...PLATE_DIGITS])).join('');
  return type === 'motorcycle' ? `${letters()}${digits(2)}${pick([...PLATE_LETTERS])}` : `${letters()}${digits(3)}`;
}

/** Wipes all collections and generates a fresh, realistic demo world. */
export async function seedDatabase(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    ParkingSpace.deleteMany({}),
    Reservation.deleteMany({}),
    Notification.deleteMany({}),
    SupportTicket.deleteMany({}),
    AuditLog.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  /* ── Users ─────────────────────────────────────────────── */
  const demoPass = await hashPassword(env.DEMO_USER_PASSWORD);
  const adminPass = await hashPassword(env.DEMO_ADMIN_PASSWORD);

  const admin = await User.create({
    name: 'Admin ApparcaCUC',
    email: env.DEMO_ADMIN_EMAIL,
    passwordHash: adminPass,
    role: 'admin',
    avatarColor: '#A3161A',
    program: 'Administración del sistema',
    isDemo: true,
  });

  const demoUser = await User.create({
    name: 'Christian Álvarez',
    email: env.DEMO_USER_EMAIL,
    passwordHash: demoPass,
    role: 'user',
    avatarColor: '#078930',
    program: 'Ingeniería de Sistemas',
    phone: '+57 300 000 0000',
    isDemo: true,
  });

  const others: IUser[] = [];
  for (const person of DEMO_PEOPLE) {
    others.push(
      await User.create({
        name: person.name,
        email: `${slug(person.name)}@demo.apparcacuc.com`,
        passwordHash: demoPass,
        role: 'user',
        avatarColor: pick(AVATAR_COLORS),
        program: person.program,
        isDemo: true,
      }),
    );
  }

  /* ── Vehicles ──────────────────────────────────────────── */
  const makeVehicle = (owner: IUser, isDefault: boolean) => {
    const spec = pick(VEHICLE_POOL);
    return Vehicle.create({
      owner: owner._id,
      plate: randomPlate(spec.type),
      type: spec.type,
      brand: spec.brand,
      model: spec.model,
      color: pick(VEHICLE_COLORS),
      isDefault,
    });
  };

  await Vehicle.create({
    owner: demoUser._id,
    plate: randomPlate('car'),
    type: 'car',
    brand: 'Mazda',
    model: '3',
    color: 'Gris',
    isDefault: true,
  });
  await Vehicle.create({
    owner: demoUser._id,
    plate: randomPlate('motorcycle'),
    type: 'motorcycle',
    brand: 'Yamaha',
    model: 'FZ 2.0',
    color: 'Azul',
    isDefault: false,
  });
  for (const u of others) {
    await makeVehicle(u, true);
    if (Math.random() < 0.4) await makeVehicle(u, false);
  }

  const allVehicles = await Vehicle.find();
  const vehiclesByUser = new Map<string, IVehicle[]>();
  for (const v of allVehicles) {
    const key = String(v.owner);
    if (!vehiclesByUser.has(key)) vehiclesByUser.set(key, []);
    vehiclesByUser.get(key)!.push(v);
  }
  const defaultVehicle = (u: IUser) => {
    const vs = vehiclesByUser.get(String(u._id)) ?? [];
    return vs.find((v) => v.isDefault) ?? vs[0] ?? null;
  };

  /* ── Parking spaces (all available first) ──────────────── */
  const spaceDocs: {
    code: string;
    zone: ParkingZone;
    position: number;
    type: SpaceType;
    state: ParkingState;
    level: number;
    sensorId: string;
    lastStateChangeAt: Date;
  }[] = [];
  for (const { zone, count } of ZONE_LAYOUT) {
    for (let position = 1; position <= count; position += 1) {
      const code = `${zone}-${String(position).padStart(2, '0')}`;
      spaceDocs.push({
        code,
        zone,
        position,
        type: spaceTypeFor(zone, position, count),
        state: 'available',
        level: 1,
        sensorId: `SIM-${code}`,
        lastStateChangeAt: new Date(),
      });
    }
  }
  const createdSpaces = await ParkingSpace.insertMany(spaceDocs);

  /* ── Live reservations that drive current map state ────── */
  let resSeq = 0;
  const nextResCode = () => reservationCode(++resSeq);
  const shuffledSpaces = [...createdSpaces].sort(() => Math.random() - 0.5);
  const occupied = shuffledSpaces.slice(0, 12);
  const reserved = shuffledSpaces.slice(12, 18);
  const disabled = shuffledSpaces.slice(18, 22);
  let holderIdx = 0;
  const nextHolder = () => others[holderIdx++ % others.length];

  for (const space of occupied) {
    const user = nextHolder();
    const veh = defaultVehicle(user);
    const durationMinutes = pick([60, 90, 120, 180]);
    const startAt = minutesAgo(randInt(20, 90));
    const res = await Reservation.create({
      code: nextResCode(),
      accessCode: accessCode(),
      user: user._id,
      space: space._id,
      spaceCode: space.code,
      vehicle: veh?._id ?? null,
      vehiclePlate: veh?.plate ?? '',
      startAt,
      endAt: new Date(startAt.getTime() + durationMinutes * 60_000),
      durationMinutes,
      state: 'checked_in',
      checkInAt: new Date(startAt.getTime() + randInt(2, 10) * 60_000),
    });
    space.state = 'occupied';
    space.currentReservation = res._id;
    space.lastStateChangeAt = new Date();
    await space.save();
  }

  for (const space of reserved) {
    const user = nextHolder();
    const veh = defaultVehicle(user);
    const durationMinutes = pick([60, 90, 120, 180]);
    const startAt = new Date(Date.now() + randInt(-20, 40) * 60_000);
    const res = await Reservation.create({
      code: nextResCode(),
      accessCode: accessCode(),
      user: user._id,
      space: space._id,
      spaceCode: space.code,
      vehicle: veh?._id ?? null,
      vehiclePlate: veh?.plate ?? '',
      startAt,
      endAt: new Date(startAt.getTime() + durationMinutes * 60_000),
      durationMinutes,
      state: 'active',
    });
    space.state = 'reserved';
    space.currentReservation = res._id;
    space.lastStateChangeAt = new Date();
    await space.save();
  }

  for (const space of disabled) {
    space.state = 'disabled';
    space.note = pick(['Mantenimiento programado', 'Señalización', 'Reservado para evento', 'Fuera de servicio']);
    space.lastStateChangeAt = new Date();
    await space.save();
  }

  /* ── Historical reservations (for history + analytics) ─── */
  const historyDocs = [];
  const historyStates = ['completed', 'completed', 'completed', 'cancelled', 'expired'] as const;
  for (let i = 0; i < 42; i += 1) {
    const user = Math.random() < 0.25 ? demoUser : pick(others);
    const space = pick(createdSpaces);
    const state = pick([...historyStates]);
    const createdAt = daysAgo(randInt(0, 20));
    const durationMinutes = pick([45, 60, 90, 120, 180]);
    const startAt = new Date(createdAt.getTime() + randInt(5, 60) * 60_000);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60_000);
    const veh = defaultVehicle(user);
    const doc: Record<string, unknown> = {
      code: nextResCode(),
      accessCode: accessCode(),
      user: user._id,
      space: space._id,
      spaceCode: space.code,
      vehicle: veh?._id ?? null,
      vehiclePlate: veh?.plate ?? '',
      startAt,
      endAt,
      durationMinutes,
      state,
      createdAt,
      updatedAt: endAt,
    };
    if (state === 'completed') {
      doc.checkInAt = new Date(startAt.getTime() + 5 * 60_000);
      doc.checkOutAt = endAt;
    } else if (state === 'cancelled') {
      doc.cancelledAt = new Date(startAt.getTime() - randInt(5, 30) * 60_000);
      doc.cancelReason = 'Cancelada por el usuario.';
    }
    historyDocs.push(doc);
  }
  await Reservation.insertMany(historyDocs, NO_TIMESTAMPS);

  /* ── Notifications for the demo user ───────────────────── */
  const notifs = [
    { type: 'system', title: '¡Bienvenido a ApparcaCUC!', message: 'Explora el mapa del estacionamiento y crea tu primera reserva.', read: true, createdAt: daysAgo(6) },
    { type: 'reservation', title: 'Reserva completada', message: 'Tu reserva en C-07 finalizó correctamente. ¡Gracias por usar ApparcaCUC!', read: true, createdAt: daysAgo(4) },
    { type: 'space', title: 'Espacio liberado', message: 'El espacio B-02 que seguías quedó disponible.', read: true, createdAt: daysAgo(2) },
    { type: 'reservation', title: 'Recordatorio de reserva', message: 'Recuerda registrar tu ingreso con el QR al llegar al campus.', read: false, createdAt: minutesAgo(95) },
    { type: 'space', title: 'Nuevos espacios EV', message: 'Se habilitaron espacios para vehículos eléctricos en la zona D.', read: false, createdAt: minutesAgo(42) },
    { type: 'system', title: 'Sensores simulados activos', message: 'El estado del estacionamiento se actualiza mediante sensores simulados.', read: false, createdAt: minutesAgo(15) },
  ];
  await Notification.insertMany(
    notifs.map((n) => ({ ...n, user: demoUser._id, updatedAt: n.createdAt })),
    NO_TIMESTAMPS,
  );

  /* ── Support tickets ───────────────────────────────────── */
  let ticketSeq = 0;
  const ticketDocs = TICKET_TEMPLATES.map((t, i) => {
    const owner = i < 2 ? demoUser : pick(others);
    const status = pick(['pending', 'in_review', 'resolved']);
    return {
      code: `SUP-${String(++ticketSeq).padStart(4, '0')}`,
      user: owner._id,
      userName: owner.name,
      userEmail: owner.email,
      category: t.category,
      subject: t.subject,
      message: t.message,
      status,
      createdAt: daysAgo(randInt(0, 10)),
      updatedAt: new Date(),
    };
  });
  await SupportTicket.insertMany(ticketDocs, NO_TIMESTAMPS);

  /* ── Audit log (sensor / admin trail) ──────────────────── */
  const audits = [
    { actorType: 'sensor', actorLabel: 'Sensor A-04', action: 'space.state_change', target: 'A-04', from: 'available', to: 'occupied', createdAt: minutesAgo(9) },
    { actorType: 'sensor', actorLabel: 'Sensor B-09', action: 'space.state_change', target: 'B-09', from: 'occupied', to: 'available', createdAt: minutesAgo(21) },
    { actorType: 'admin', actorLabel: 'Admin ApparcaCUC', action: 'space.state_change', target: 'D-05', from: 'available', to: 'disabled', createdAt: minutesAgo(38) },
    { actorType: 'user', actorLabel: pick(others).name, action: 'reservation.create', target: 'APC-2026-00003', to: 'reserved', createdAt: minutesAgo(52) },
    { actorType: 'sensor', actorLabel: 'Sensor C-02', action: 'space.state_change', target: 'C-02', from: 'reserved', to: 'occupied', createdAt: minutesAgo(64) },
    { actorType: 'system', actorLabel: 'Sistema', action: 'reservation.expired', target: 'APC-2026-00001', to: 'available', createdAt: minutesAgo(120) },
  ];
  await AuditLog.insertMany(
    audits.map((a) => ({ ...a, updatedAt: a.createdAt })),
    NO_TIMESTAMPS,
  );

  /* ── Counters continue after seeded data ───────────────── */
  await Counter.create([
    { _id: 'reservation', seq: resSeq },
    { _id: 'ticket', seq: ticketSeq },
  ]);

  const totalUsers = others.length + 2;
  logger.info(
    `Seed complete → ${totalUsers} users, ${createdSpaces.length} spaces, ${resSeq} reservations, ${ticketDocs.length} tickets.`,
  );
}

/** Seeds only when the database is empty (used on server startup). */
export async function runSeedIfNeeded(): Promise<void> {
  const count = await User.countDocuments();
  if (count > 0) {
    logger.info('Database already contains data — skipping seed.');
    return;
  }
  logger.info('Empty database detected — seeding demo data…');
  await seedDatabase();
}

// Allow `npm run seed` to (re)seed a persistent database directly.
if (require.main === module) {
  (async () => {
    await connectDatabase();
    await seedDatabase();
    await disconnectDatabase();
    process.exit(0);
  })().catch((err) => {
    logger.error('Seed failed:', err);
    process.exit(1);
  });
}
