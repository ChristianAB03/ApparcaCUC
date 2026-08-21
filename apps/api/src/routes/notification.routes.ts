import { Router } from 'express';
import * as ctrl from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParams } from '../schemas/common.schema';

const router = Router();
router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/unread-count', ctrl.unreadCount);
router.post('/read-all', ctrl.markAllRead);
router.patch('/:id/read', validate({ params: idParams }), ctrl.markRead);

export default router;
