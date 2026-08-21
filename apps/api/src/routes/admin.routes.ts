import { Router } from 'express';
import * as admin from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSpaceSchema, updateSpaceSchema } from '../schemas/parking.schema';
import { updateTicketSchema, ticketsQuery } from '../schemas/support.schema';
import { reservationHistoryQuery, cancelReservationSchema } from '../schemas/reservation.schema';
import { idParams } from '../schemas/common.schema';

const router = Router();
// Every admin route is protected on the server — the frontend is never trusted.
router.use(requireAuth, requireAdmin);

router.get('/overview', admin.overview);
router.get('/statistics', admin.statistics);
router.get('/audit-logs', admin.auditLogs);

router.get('/spaces', admin.listSpaces);
router.post('/spaces', validate({ body: createSpaceSchema }), admin.createSpace);
router.patch('/spaces/:id', validate({ params: idParams, body: updateSpaceSchema }), admin.updateSpace);

router.get('/reservations', validate({ query: reservationHistoryQuery }), admin.listReservations);
router.patch(
  '/reservations/:id/cancel',
  validate({ params: idParams, body: cancelReservationSchema }),
  admin.cancelReservationAsAdmin,
);

router.get('/users', admin.listUsers);

router.get('/reports', validate({ query: ticketsQuery }), admin.listTickets);
router.patch('/reports/:id', validate({ params: idParams, body: updateTicketSchema }), admin.updateTicket);

export default router;
