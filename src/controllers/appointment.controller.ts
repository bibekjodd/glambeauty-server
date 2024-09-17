import {
  getAdminAppointmentsQuerySchema,
  getAppointmentsQuerySchema,
  registerAppointmentSchema
} from '@/dtos/appointment.dto';
import { db } from '@/lib/database';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointments } from '@/schemas/appointment.schema';
import { User, users } from '@/schemas/user.schema';
import { checkAppointmentAvailability, fetchAppointments } from '@/services/appointment.service';
import { eq } from 'drizzle-orm';

export const registerAppointment = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  if (req.user.role === 'admin' || req.user.role === 'staff')
    throw new ForbiddenException("Admin or staffs can't request for appointment");

  const { date, serviceId, staffId } = registerAppointmentSchema.parse(req.body);
  const { service } = await checkAppointmentAvailability({ date, serviceId, staffId });
  const ends_at = new Date(
    new Date(date).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();
  await db.insert(appointments).values({
    customer_id: req.user.id,
    starts_at: date,
    ends_at,
    staff_id: staffId,
    service_id: serviceId,
    status: 'pending'
  });

  return res.json({ message: 'Appointment registered successfully' });
});

export const getAppointments = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { cursor } = getAppointmentsQuerySchema.parse(req.query);
  const result = await fetchAppointments({
    cursor,
    entity: req.user.role === 'user' ? 'customer' : 'staff',
    userId: req.user.id
  });
  return res.json({ appointments: result });
});

export const getAllAppointments = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin')
    throw new ForbiddenException('Only admins can access requested resource');
  const { cursor, user_id } = getAdminAppointmentsQuerySchema.parse(req.body);

  let user: User | undefined = undefined;
  if (user_id) {
    [user] = await db.select().from(users).where(eq(users.id, user_id));
  }

  if (user) {
    const result = await fetchAppointments({
      cursor,
      entity: user.role === 'staff' ? 'staff' : 'customer',
      userId: user.id
    });
    return res.json({ appointments: result });
  }
  const result = await fetchAppointments({ cursor, entity: null, userId: null });
  return res.json({ appointments: result });
});

export const rescheduleAppointment = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const appointmentId = req.params.id;
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId));
  if (!appointment) throw new NotFoundException('Appointment not found');

  if (appointment.isRescheduled) {
    if (req.user.role !== 'admin')
      throw new BadRequestException('Appointment can be rescheduled only once');
  }

  if (appointment.status !== 'pending')
    throw new BadRequestException(`Appointment is already ${appointment.status}`);

  const data = registerAppointmentSchema.parse(req.body);
  const { service } = await checkAppointmentAvailability(data);
  const ends_at = new Date(
    new Date(data.date).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();

  await db
    .update(appointments)
    .set({ starts_at: data.date, isRescheduled: true, ends_at })
    .where(eq(appointments.id, appointmentId));

  return res.json({ message: 'Appointment rescheduled successfully' });
});

export const cancelAppointment = handleAsync<{ id: string }, unknown, { cancelReason: unknown }>(
  async (req, res) => {
    if (!req.user) throw new UnauthorizedException();

    if (req.user.role === 'staff')
      throw new BadRequestException("Staffs can't cancel the appointment");

    let cancelReason: string | null = null;
    if (typeof req.body.cancelReason === 'string') cancelReason = req.body.cancelReason;
    cancelReason = cancelReason?.trim().slice(0, 200) || null;

    const appointmentId = req.params.id;
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId));
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== 'pending')
      throw new BadRequestException(`Appointment is already ${appointment.status}`);

    await db
      .update(appointments)
      .set({ cancelReason, status: 'cancelled' })
      .where(eq(appointments.id, appointmentId));
    return res.json({ message: 'Appointment cancelled successfully' });
  }
);
