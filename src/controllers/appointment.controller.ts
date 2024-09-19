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
import { appointmentStatusNotification } from '@/notifications/appointment.notifications';
import { appointments, selectAppointmentSnapshot } from '@/schemas/appointment.schema';
import { selectServicesSnapshot, services } from '@/schemas/service.schema';
import {
  customers,
  selectCustomerSnapshot,
  selectUserSnapshot,
  User,
  users
} from '@/schemas/user.schema';
import { checkAppointmentAvailability, fetchAppointments } from '@/services/appointment.service';
import { eq } from 'drizzle-orm';

export const registerAppointment = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  if (req.user.role === 'admin' || req.user.role === 'staff')
    throw new ForbiddenException("Admin or staffs can't request for appointment");

  const { date, serviceId, staffId } = registerAppointmentSchema.parse(req.body);
  const { service, staff } = await checkAppointmentAvailability({ date, serviceId, staffId });
  const endsAt = new Date(
    new Date(date).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();
  const [bookedAppointment] = await db
    .insert(appointments)
    .values({
      customerId: req.user.id,
      startsAt: date,
      endsAt,
      staffId,
      serviceId,
      status: 'pending'
    })
    .returning();

  if (!bookedAppointment) throw new BadRequestException(`Unknown error occurred`);
  appointmentStatusNotification({
    appointmentId: bookedAppointment.id,
    date: bookedAppointment.startsAt,
    reason: null,
    serviceTitle: service.title,
    staff,
    user: req.user,
    status: 'pending'
  });

  return res.json({
    message: 'Appointment registered successfully',
    appointmentId: bookedAppointment.id
  });
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

export const getAppointmentDetail = handleAsync<{ id: string }>(async (req, res) => {
  const appointmentId = req.params.id;
  const [appointment] = await db
    .select({
      ...selectAppointmentSnapshot,
      customer: selectCustomerSnapshot,
      staff: selectUserSnapshot,
      service: selectServicesSnapshot
    })
    .from(appointments)
    .innerJoin(customers, eq(appointments.customerId, customers.id))
    .innerJoin(users, eq(appointments.staffId, users.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, appointmentId));
  if (!appointment) throw new NotFoundException('Appointment not found');
  return res.json({ appointment });
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
  const { service, staff } = await checkAppointmentAvailability(data);
  const endsAt = new Date(
    new Date(data.date).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();

  const [rescheduledAppointment] = await db
    .update(appointments)
    .set({ startsAt: data.date, isRescheduled: true, endsAt })
    .where(eq(appointments.id, appointmentId))
    .returning();
  if (!rescheduledAppointment)
    throw new BadRequestException(`Unknown error occurred while rescheduling appointment`);

  appointmentStatusNotification({
    appointmentId: rescheduledAppointment.id,
    date: rescheduledAppointment.startsAt,
    reason: null,
    serviceTitle: service.title,
    staff,
    user: req.user,
    status: 'rescheduled'
  });

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
      .select({
        ...selectAppointmentSnapshot,
        staff: selectUserSnapshot,
        customer: selectCustomerSnapshot,
        service: selectServicesSnapshot
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(customers, eq(appointments, eq(appointments.customerId, customers.id)))
      .innerJoin(users, eq(appointments.staffId, users.id))
      .groupBy(appointments.id);

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.status !== 'pending')
      throw new BadRequestException(`Appointment is already ${appointment.status}`);

    const [cancelledAppointment] = await db
      .update(appointments)
      .set({ cancelReason, status: 'cancelled' })
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!cancelledAppointment)
      throw new BadRequestException(`Unknown error occurred while cancelling appointment`);

    appointmentStatusNotification({
      appointmentId,
      date: appointment.startsAt,
      reason: cancelReason || null,
      serviceTitle: appointment.service?.title || '',
      staff: appointment.staff,
      status: 'cancelled',
      user: appointment.customer
    });

    return res.json({ message: 'Appointment cancelled successfully' });
  }
);
