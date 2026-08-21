import { Router } from 'express';
import authRoutes from './auth.routes';
import parkingRoutes from './parking.routes';
import reservationRoutes from './reservation.routes';
import vehicleRoutes from './vehicle.routes';
import notificationRoutes from './notification.routes';
import supportRoutes from './support.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'apparcacuc-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/parking', parkingRoutes);
router.use('/reservations', reservationRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);
router.use('/admin', adminRoutes);

export default router;
