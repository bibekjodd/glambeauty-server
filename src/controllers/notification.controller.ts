import { getNotificationsQuerySchema } from '@/dtos/notification.dto';
import { db } from '@/lib/database';
import { UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { notifications } from '@/schemas/notification.schema';
import { and, eq, lt } from 'drizzle-orm';

export const getNotifications = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  console.log('get notifications');
  const { cursor, limit } = getNotificationsQuerySchema.parse(req.query);

  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.userId, req.user.id), lt(notifications.receivedAt, cursor)))
    .limit(limit);

  return res.json({ notifications: result });
});
