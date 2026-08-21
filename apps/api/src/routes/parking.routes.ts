import { Router } from 'express';
import * as parking from '../controllers/parking.controller';
import { setSpaceState } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { spacesQuery, updateSpaceStatusSchema } from '../schemas/parking.schema';
import { idParams } from '../schemas/common.schema';

const router = Router();
router.use(requireAuth);

router.get('/overview', parking.getOverview);
router.get('/spaces', validate({ query: spacesQuery }), parking.listSpaces);
router.get('/spaces/:id', validate({ params: idParams }), parking.getSpace);

// Change a space state (IoT simulator / manual override) — admin only.
router.patch(
  '/spaces/:id/status',
  requireAdmin,
  validate({ params: idParams, body: updateSpaceStatusSchema }),
  setSpaceState,
);

export default router;
