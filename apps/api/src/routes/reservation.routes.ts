import { Router } from 'express';
import * as ctrl from '../controllers/reservation.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createReservationSchema,
  reservationHistoryQuery,
  cancelReservationSchema,
  accessScanSchema,
} from '../schemas/reservation.schema';
import { idParams } from '../schemas/common.schema';

const router = Router();
router.use(requireAuth);

router.get('/', validate({ query: reservationHistoryQuery }), ctrl.listMine);
router.get('/active', ctrl.getActive);
router.post('/', validate({ body: createReservationSchema }), ctrl.createOne);
router.post('/access-scan', validate({ body: accessScanSchema }), ctrl.accessScan);
router.get('/:id', validate({ params: idParams }), ctrl.getOne);
router.patch('/:id/cancel', validate({ params: idParams, body: cancelReservationSchema }), ctrl.cancel);

export default router;
