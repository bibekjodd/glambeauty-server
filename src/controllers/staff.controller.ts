import { availableStaffsQuerySchema } from '@/dtos/staff.dto';
import { db } from '@/lib/database';
import { NotFoundException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointments } from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, asc, eq, gt, lte, or, sql } from 'drizzle-orm';

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

  const starts_at = date;
  const result = await db
    .select({ ...selectUserSnapshot, activeAppointments: sql<number>`count(${appointments.id})` })
    .from(users)
    .leftJoin(
      appointments,
      and(
        lte(appointments.startsAt, starts_at),
        gt(appointments.endsAt, starts_at),
        eq(appointments.status, 'pending'),
        eq(appointments.staffId, users.id)
      )
    )
    .where(eq(users.role, 'staff'))
    .groupBy(users.id);

  return res.json({ staffs: result });
});
