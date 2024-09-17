import { db } from '@/lib/database';
import { appointments, selectAppointmentSnapshot } from '@/schemas/appointment.schema';
import { selectServicesSnapshot, Service, services } from '@/schemas/service.schema';
import { selectUserSnapshot, User, users } from '@/schemas/user.schema';
import { and, desc, eq, gt, lt, sql } from 'drizzle-orm';

import { RegisterAppointmentSchema } from '@/dtos/appointment.dto';
import { BadRequestException, NotFoundException } from '@/lib/exceptions';
import { lte } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';

export const checkAppointmentAvailability = async ({
  date,
  serviceId,
  staffId
}: RegisterAppointmentSchema): Promise<{ service: Service; staff: User }> => {
  const [service] = await db.select().from(services).where(eq(services.id, serviceId));
  if (!service) throw new NotFoundException('Service does not exist');

  const [staff] = await db
    .select({ ...selectUserSnapshot, activeAppointments: sql<number>`count(${appointments.id})` })
    .from(users)
    .leftJoin(
      appointments,
      and(
        lte(appointments.starts_at, date),
        gt(appointments.ends_at, date),
        eq(appointments.status, 'pending'),
        eq(appointments.staff_id, users.id)
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
    }
  | { cursor: string; userId: null; entity: null };
export const fetchAppointments = async ({ cursor, userId, entity }: FetchAppointmentsOptions) => {
  const customers = alias(users, 'customers');
  const result = await db
    .select({
      ...selectAppointmentSnapshot,
      customer: selectUserSnapshot,
      staff: selectUserSnapshot,
      service: selectServicesSnapshot
    })
    .from(appointments)
    .where(
      and(
        lt(appointments.starts_at, cursor),
        userId
          ? eq(entity === 'customer' ? appointments.customer_id : appointments.staff_id, userId)
          : undefined
      )
    )
    .innerJoin(customers, eq(appointments.customer_id, customers.id))
    .innerJoin(users, eq(appointments.staff_id, users.id))
    .leftJoin(services, eq(appointments.service_id, services.id))
    .groupBy(appointments.id)
    .orderBy(desc(appointments.starts_at))
    .limit(20);
  return result;
};
