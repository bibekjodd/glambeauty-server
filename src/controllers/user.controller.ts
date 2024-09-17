import {
  availableStaffsQuerySchema,
  queryUsersSchema,
  updateProfileSchema,
  updateUserSchema
} from '@/dtos/user.dto';
import { db } from '@/lib/database';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { appointments } from '@/schemas/appointment.schema';
import { services } from '@/schemas/service.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, asc, eq, gt, like, lte, or, sql } from 'drizzle-orm';

export const queryUsers = handleAsync(async (req, res) => {
  const { limit, page, q, role } = queryUsersSchema.parse(req.query);
  const offset = (page - 1) * limit;
  const result = await db
    .select()
    .from(users)
    .where(
      and(or(like(users.name, `%${q}%`), like(users.email, `%${q}%`)), role && eq(users.role, role))
    )
    .limit(limit)
    .offset(offset);

  return res.json({ users: result });
});

export const getStaffs = handleAsync(async (req, res) => {
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.role, 'staff'), eq(users.role, 'admin')))
    .orderBy(asc(users.name));
  return res.json({ staffs: result });
});

export const getProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  return res.json({ user: req.user });
});

export const getUserDetails = handleAsync<{ id: string }>(async (req, res) => {
  const userId = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new NotFoundException('User not found');
  return res.json({ user });
});

export const logoutUser = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  req.logout(() => {
    res.json({ message: 'User logged out successfully!' });
  });
});

export const updateProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const data = updateProfileSchema.parse(req.body);
  const [user] = await db.update(users).set(data).where(eq(users.id, req.user.id)).returning();
  return res.json({ user: user || null });
});

export const updateUser = handleAsync<{ id: string }, unknown, { role: 'staff' | 'user' }>(
  async (req, res) => {
    if (!req.user) throw new UnauthorizedException();
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can add the staffs');

    const staffId = req.params.id;
    if (req.user.id === staffId) throw new ForbiddenException("Admins can't demote themselves");

    const data = updateUserSchema.parse(req.body);
    const [updatedStaff] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, staffId))
      .returning();
    if (!updatedStaff) throw new NotFoundException('User does not exist');

    return res.json({ message: 'User updated successfully' });
  }
);

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
        lte(appointments.starts_at, starts_at),
        gt(appointments.ends_at, starts_at),
        eq(appointments.status, 'pending'),
        eq(appointments.staff_id, users.id)
      )
    )
    .where(eq(users.role, 'staff'))
    .groupBy(users.id);

  return res.json({ staffs: result });
});
