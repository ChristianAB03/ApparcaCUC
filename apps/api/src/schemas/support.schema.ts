import { z } from 'zod';
import { TICKET_CATEGORIES, TICKET_STATES } from '../constants';

export const createTicketSchema = z
  .object({
    category: z.enum(TICKET_CATEGORIES),
    subject: z.string().trim().min(4, 'Describe brevemente el asunto.').max(120),
    message: z.string().trim().min(10, 'Cuéntanos un poco más de detalle.').max(1000),
    reference: z.string().trim().max(40).optional(),
  })
  .strict();

export const updateTicketSchema = z
  .object({
    status: z.enum(TICKET_STATES).optional(),
    adminNote: z.string().trim().max(500).optional(),
  })
  .strict();

export const ticketsQuery = z
  .object({
    status: z.enum(TICKET_STATES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
