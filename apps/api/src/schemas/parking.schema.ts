import { z } from 'zod';
import { PARKING_STATES, SPACE_TYPES, PARKING_ZONES } from '../constants';

export const spacesQuery = z
  .object({
    zone: z.enum(PARKING_ZONES).optional(),
    state: z.enum(PARKING_STATES).optional(),
    type: z.enum(SPACE_TYPES).optional(),
  })
  .strict();

/** Admin (or simulated sensor) changing a space state. */
export const updateSpaceStatusSchema = z
  .object({
    state: z.enum(PARKING_STATES),
    note: z.string().trim().max(160).optional(),
    source: z.enum(['admin', 'sensor']).default('admin'),
  })
  .strict();

export const createSpaceSchema = z
  .object({
    zone: z.enum(PARKING_ZONES),
    position: z.coerce.number().int().min(1).max(99),
    type: z.enum(SPACE_TYPES).default('standard'),
    level: z.coerce.number().int().min(1).max(5).default(1),
    state: z.enum(PARKING_STATES).default('available'),
  })
  .strict();

export const updateSpaceSchema = z
  .object({
    type: z.enum(SPACE_TYPES).optional(),
    level: z.coerce.number().int().min(1).max(5).optional(),
    note: z.string().trim().max(160).optional(),
  })
  .strict();
