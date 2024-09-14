import { db } from '@/lib/database';
import { appointments, selectAppointmentSnapshot } from '@/schemas/appointment.schema';
import { selectServicesSnapshot, services } from '@/schemas/service.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, eq, lt } from 'drizzle-orm';

import { RegisterAppointmentSchema } from '@/dtos/appointment.dto';
import { BadRequestException } from '@/lib/exceptions';
import { gte, lte } from 'drizzle-orm';

export const checkAppointmentAvailability = async ({
  date,
  serviceId,
  staffId
}: RegisterAppointmentSchema) => {
  const staffResult = db
    .select()
    .from(users)
    .where(and(eq(users.id, staffId), eq(users.active, true), eq(users.role, 'staff')))
    .execute()
    .then((result) => result[0]);

  const serviceResult = db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.active, true)))
    .execute()
    .then((result) => result[0]);

  const minDateToCheck = new Date(new Date(date).getTime() - 12 * 60 * 60 * 1000);
  const maxDateToCheck = new Date(new Date(date).getTime() + 12 * 60 * 60 * 1000);
  const appointmentsResult = db
    .select()
    .from(appointments)
    .where(
      and(
        gte(appointments.date, minDateToCheck.toISOString()),
        lte(appointments.date, maxDateToCheck.toISOString()),
        eq(appointments.staff_id, staffId),
        eq(appointments.status, 'pending')
      )
    )
    .execute();

  const [staff, service, pendingAppointments] = await Promise.all([
    staffResult,
    serviceResult,
    appointmentsResult
  ]);
  if (!staff) throw new BadRequestException('Staff does not exist or is not active currently');
  if (!service) throw new BadRequestException('Service does not exist or is not available');

  pendingAppointments.forEach((appointment) => {
    const requestedServiceStartDate = new Date(date).toISOString();
    const requestedServiceCompletionDate = new Date(
      new Date(date).getTime() + service.duration * 60 * 60 * 1000
    ).toISOString();

    if (
      appointment.date >= requestedServiceStartDate ||
      appointment.date < requestedServiceCompletionDate
    ) {
      throw new BadRequestException('The selected staff is busy on the target appointment date');
    }
  });
};

type FetchAppointmentsOptions =
  | {
      cursor: string;
      userId: string;
      entity: 'customer' | 'staff';
    }
  | { cursor: string; userId: null; entity: null };
export const fetchAppointments = async ({ cursor, userId, entity }: FetchAppointmentsOptions) => {
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
        lt(appointments.date, cursor),
        userId
          ? eq(entity === 'customer' ? appointments.customer_id : appointments.staff_id, userId)
          : undefined
      )
    )
    .innerJoin(users, eq(appointments.customer_id, users.id))
    .innerJoin(users, eq(appointments.staff_id, users.id))
    .leftJoin(services, eq(appointments.service_id, services.id))
    .limit(20);
  return result;
};
