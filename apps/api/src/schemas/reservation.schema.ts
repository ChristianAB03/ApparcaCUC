import { z } from 'zod';
import { objectId } from './common.schema';
import { RESERVATION_STATES } from '../constants';

export const createReservationSchema = z
  .object({
    spaceId: objectId,
    vehicleId: objectId.optional(),
    startAt: z.coerce.date(),
    durationMinutes: z.coerce
      .number()
      .int()
      .min(15, 'La duración mínima es 15 minutos.')
      .max(720, 'La duración máxima es 12 horas.'),
  })
  .strict();

export const reservationHistoryQuery = z
  .object({
    state: z.enum(RESERVATION_STATES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const cancelReservationSchema = z
  .object({ reason: z.string().trim().max(200).optional() })
  .strict();

export const accessScanSchema = z
  .object({ code: z.string().trim().min(1, 'Ingresa un código de reserva.').max(40) })
  .strict();

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
