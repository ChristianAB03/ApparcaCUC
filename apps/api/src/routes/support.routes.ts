import { Router } from 'express';
import * as ctrl from '../controllers/support.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTicketSchema } from '../schemas/support.schema';

const router = Router();
router.use(requireAuth);

router.get('/reports', ctrl.listMine);
router.post('/reports', validate({ body: createTicketSchema }), ctrl.create);

export default router;
