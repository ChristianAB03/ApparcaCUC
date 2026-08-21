import { z } from 'zod';
import { VEHICLE_TYPES } from '../constants';

export const createVehicleSchema = z
  .object({
    plate: z
      .string()
      .trim()
      .toUpperCase()
      .min(4, 'La placa es demasiado corta.')
      .max(12, 'La placa es demasiado larga.')
      .regex(/^[A-Z0-9-]+$/, 'La placa solo puede contener letras, números y guiones.'),
    type: z.enum(VEHICLE_TYPES).default('car'),
    brand: z.string().trim().max(40).default(''),
    model: z.string().trim().max(40).default(''),
    color: z.string().trim().max(30).default(''),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
