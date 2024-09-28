import { availableStaffsQuerySchema } from '@/dtos/staff.dto';
import { db } from '@/lib/database';
import { NotFoundException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointments } from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, asc, eq, gt, lt, lte, or, sql } from 'drizzle-orm';

export const getStaffs = handleAsync(async (req, res) => {
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.role, 'staff'), eq(users.role, 'admin')))
    .orderBy(asc(users.name));
  return res.json({ staffs: result });
});

export const availableStaffs = handleAsync(async (req, res) => {
  const { date, service_id } = availableStaffsQuerySchema.parse(req.query);
  const [service] = await db.select().from(services).where(eq(services.id, service_id));

  if (!service) throw new NotFoundException('The requested service is not found');

  const startsAt = date;
  const endsAt = new Date(
    new Date(startsAt).getTime() + service.duration * 60 * 60 * 1000
  ).toISOString();
  const result = await db
    .select({ ...selectUserSnapshot, activeAppointments: sql<number>`count(${appointments.id})` })
    .from(users)
    .leftJoin(
      appointments,
      and(
        eq(appointments.status, 'pending'),
        eq(appointments.staffId, users.id),
        or(
          and(lte(appointments.startsAt, startsAt), gt(appointments.endsAt, startsAt)),
          and(lt(appointments.startsAt, endsAt), gt(appointments.endsAt, endsAt))
        )
      )
    )
    .where(eq(users.role, 'staff'))
    .groupBy(users.id);

  return res.json({ staffs: result });
});
