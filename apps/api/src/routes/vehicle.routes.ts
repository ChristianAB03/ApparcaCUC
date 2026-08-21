import { Router } from 'express';
import * as ctrl from '../controllers/vehicle.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVehicleSchema, updateVehicleSchema } from '../schemas/vehicle.schema';
import { idParams } from '../schemas/common.schema';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.post('/', validate({ body: createVehicleSchema }), ctrl.create);
router.put('/:id', validate({ params: idParams, body: updateVehicleSchema }), ctrl.update);
router.delete('/:id', validate({ params: idParams }), ctrl.remove);

export default router;
