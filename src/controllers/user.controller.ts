import { queryUsersSchema, updateProfileSchema, updateUserSchema } from '@/dtos/user.dto';
import { db } from '@/lib/database';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { roleUpdateNotification } from '@/notifications/user.notifications';
import { users } from '@/schemas/user.schema';
import { and, eq, like, or } from 'drizzle-orm';

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

export const updateProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const data = updateProfileSchema.parse(req.body);
  const [user] = await db.update(users).set(data).where(eq(users.id, req.user.id)).returning();
  return res.json({ user: user || null });
});

export const updateUser = handleAsync<{ id: string }, unknown, { role: 'staff' | 'user' }>(
  async (req, res) => {
    if (!req.user) throw new UnauthorizedException();
    if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can update the users');
    const data = updateUserSchema.parse(req.body);

    const staffId = req.params.id;
    if (req.user.id === staffId && data.role)
      throw new ForbiddenException("Admins can't demote themselves");

    const [updatedStaff] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, staffId))
      .returning();
    if (!updatedStaff) throw new NotFoundException('User does not exist');
    if (data.role) {
      roleUpdateNotification({
        user: { email: updatedStaff.email, id: updatedStaff.id, name: updatedStaff.name },
        role: data.role
      });
    }
    return res.json({ message: 'User updated successfully' });
  }
);
