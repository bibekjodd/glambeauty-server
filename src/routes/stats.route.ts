import {
  getAppointmentStats,
  getBookingStats,
  getTopServices,
  getTopStaffs
} from '@/controllers/stats.controller';
import { Router } from 'express';

const router = Router();
export const statsRoute = router;
router.get('/bookings', getBookingStats);
router.get('/appointments', getAppointmentStats);
router.get('/services', getTopServices);
router.get('/staffs', getTopStaffs);
