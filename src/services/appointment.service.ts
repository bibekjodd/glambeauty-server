import { db } from '@/lib/database';
import {
  appointments,
  AppointmentStatus,
  selectAppointmentSnapshot
} from '@/schemas/appointment.schema';
import { selectServicesSnapshot, Service, services } from '@/schemas/service.schema';
import {
  customers,
  selectCustomerSnapshot,
  selectUserSnapshot,
  User,
  users
} from '@/schemas/user.schema';
import { and, desc, eq, gt, lt, or, sql } from 'drizzle-orm';

import { RegisterAppointmentSchema } from '@/dtos/appointment.dto';
import { BadRequestException, NotFoundException } from '@/lib/exceptions';
import { lte } from 'drizzle-orm';

export const checkAppointmentAvailability = async ({
  date,
  serviceId,
  staffId
}: RegisterAppointmentSchema): Promise<{ service: Service; staff: User }> => {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) throw new NotFoundException('Service does not exist');

  const endsAt = new Date(
    new Date(date).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();
  const [staff] = await db
    .select({ ...selectUserSnapshot, activeAppointments: sql<number>`count(${appointments.id})` })
    .from(users)
    .leftJoin(
      appointments,
      and(
        eq(appointments.status, 'pending'),
        eq(appointments.staffId, users.id),
        or(
          and(lte(appointments.startsAt, date), gt(appointments.endsAt, date)),
          and(lt(appointments.startsAt, endsAt), gt(appointments.endsAt, endsAt))
        )
      )
    )
    .where(and(eq(users.id, staffId), eq(users.role, 'staff')))
    .groupBy(users.id);

  if (!staff) throw new BadRequestException('Staff does not exist');
  if (staff.activeAppointments)
    throw new BadRequestException('The selected staff is busy on the selected appointment date');
  return { staff, service };
};

type FetchAppointmentsOptions =
  | {
      cursor: string;
      userId: string;
      entity: 'customer' | 'staff';
      status: AppointmentStatus | undefined;
    }
  | { cursor: string; userId: null; entity: null; status: AppointmentStatus | undefined };
export const fetchAppointments = async ({
  cursor,
  userId,
  entity,
  status
}: FetchAppointmentsOptions) => {
  const result = await db
    .select({
      ...selectAppointmentSnapshot,
      customer: selectCustomerSnapshot,
      staff: selectUserSnapshot,
      service: selectServicesSnapshot
    })
    .from(appointments)
    .where(
      and(
        lt(appointments.startsAt, cursor),
        userId
          ? eq(entity === 'customer' ? appointments.customerId : appointments.staffId, userId)
          : undefined,
        status ? eq(appointments.status, status) : undefined
      )
    )
    .innerJoin(customers, eq(appointments.customerId, customers.id))
    .innerJoin(users, eq(appointments.staffId, users.id))
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .groupBy(appointments.id)
    .orderBy(desc(appointments.startsAt))
    .limit(20);
  return result;
};
