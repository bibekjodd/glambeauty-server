import { getFeedbacksQuerySchema, postFeedbackSchema } from '@/dtos/feedback.dto';
import { db } from '@/lib/database';
import { ForbiddenException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { feedbacks, selectFeedbackSnapshot } from '@/schemas/feedback.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, desc, eq, lt } from 'drizzle-orm';

export const postFeedback = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'user')
    throw new ForbiddenException("Admins and staffs can't post feedbacks");

  const data = postFeedbackSchema.parse(req.body);
  await db.insert(feedbacks).values({ ...data, userId: req.user.id });
  return res.json({ message: 'Your feedback has been received successfully' });
});

export const getFeedbacks = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  if (req.user.role !== 'admin') throw new ForbiddenException('Only admins can see the feedbacks');

  const { limit, cursor, rating } = getFeedbacksQuerySchema.parse(req.query);

  const result = await db
    .select({ ...selectFeedbackSnapshot, user: selectUserSnapshot })
    .from(feedbacks)
    .where(and(lt(feedbacks.receivedAt, cursor), rating ? eq(feedbacks.rating, rating) : undefined))
    .innerJoin(users, eq(feedbacks.userId, users.id))
    .groupBy(feedbacks.id)
    .orderBy((t) => desc(t.receivedAt))
    .limit(limit);

  return res.json({ feedbacks: result });
});
