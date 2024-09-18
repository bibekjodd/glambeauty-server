import { getDashboardStatsQuerySchema } from '@/dtos/stats.dto';
import { ForbiddenException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointmentStats, topServices, topStaffs } from '@/services/stats.service';

export const getBookingStats = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin')
    throw new ForbiddenException('Only admins can access this resource');

  const { start, end } = getDashboardStatsQuerySchema.parse(req.query);
  const bookings = await appointmentStats({ start, end, entity: 'bookings' });
  return res.json({ bookings });
});

export const getAppointmentStats = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin')
    throw new ForbiddenException('Only admins can access this resource');

  const { start, end } = getDashboardStatsQuerySchema.parse(req.query);
  const result = await appointmentStats({ start, end, entity: 'appointments' });
  return res.json({ appointments: result });
});

export const getTopServices = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin')
    throw new ForbiddenException('Only admins can access this resource');

  const { start, end } = getDashboardStatsQuerySchema.parse(req.query);
  const result = await topServices({ start, end });
  return res.json({ services: result });
});

export const getTopStaffs = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin')
    throw new ForbiddenException('Only admins can access this resource');

  const { start, end } = getDashboardStatsQuerySchema.parse(req.query);
  const staffs = await topStaffs({ start, end });
  return res.json({ staffs });
});
