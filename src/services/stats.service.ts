import { db } from '@/lib/database';
import {
  appointments,
  AppointmentStats,
  selectAppointmentsStats
} from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';

export const appointmentStats = async ({
  start,
  end,
  entity
}: {
  start: string;
  end: string;
  entity: 'bookings' | 'appointments';
}): Promise<AppointmentStats[]> => {
  const result = await db
    .select(selectAppointmentsStats)
    .from(appointments)
    .where(
      and(
        lt(entity === 'appointments' ? appointments.startsAt : appointments.bookedAt, start),
        gte(entity === 'appointments' ? appointments.startsAt : appointments.bookedAt, end)
      )
    )
    .orderBy(desc(entity === 'appointments' ? appointments.startsAt : appointments.startsAt));
  return result;
};

export const topServices = async ({ start, end }: { start: string; end: string }) => {
  const result = await db
    .select({
      id: services.id,
      title: services.title,
      count: sql<number>`count(${appointments.id})`
    })
    .from(services)
    .innerJoin(
      appointments,
      and(
        eq(services.id, appointments.serviceId),
        lt(appointments.bookedAt, start),
        gte(appointments.bookedAt, end)
      )
    )
    .groupBy(services.id)
    .orderBy((t) => desc(t.count))
    .limit(10);

  return result;
};

export const topStaffs = async ({ start, end }: { start: string; end: string }) => {
  const staffs = await db
    .select({ ...selectUserSnapshot, count: sql<number>`count(${users.id})` })
    .from(appointments)
    .where(and(lt(appointments.bookedAt, start), gte(appointments.bookedAt, end)))
    .innerJoin(users, eq(appointments.staffId, users.id))
    .groupBy(appointments.staffId)
    .orderBy((t) => desc(t.count))
    .limit(10);

  return staffs;
};
