import {
  cancelAppointment,
  getAllAppointments,
  getAppointmentDetail,
  getAppointments,
  registerAppointment
} from '@/controllers/appointment.controller';
import { Router } from 'express';

const router = Router();
export const appointmentRoute = router;

router.route('/').post(registerAppointment).get(getAppointments);
router.get('/:id', getAppointmentDetail);
router.put('/:id/cancel', cancelAppointment);
router.get('/all', getAllAppointments);
