import {
  cancelAppointment,
  getAllAppointments,
  getAppointments,
  registerAppointment
} from '@/controllers/appointment.controller';
import { Router } from 'express';

const router = Router();
export const appointmentRoute = router;

router.route('/').post(registerAppointment).get(getAppointments);
router.put('/:id/cancel', cancelAppointment);
router.get('/all', getAllAppointments);
