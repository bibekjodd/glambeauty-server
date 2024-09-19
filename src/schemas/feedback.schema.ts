import { createId } from '@paralleldrive/cuid2';
import { foreignKey, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';

export const feedbacks = sqliteTable(
  'feedbacks',
  {
    id: text('id').notNull().$defaultFn(createId),
    title: text('title').notNull(),
    text: text('text').notNull(),
    userId: text('user_id').notNull(),
    rating: integer('rating').notNull(),
    receivedAt: text('received_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  function constraints(feedbacks) {
    return {
      primaryKey: primaryKey({ name: 'feedbacks_pkey', columns: [feedbacks.id] }),
      userReference: foreignKey({
        name: 'fk_user_id',
        columns: [feedbacks.userId],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade'),
      userIndex: index('user_idx_feedbacks').on(feedbacks.userId)
    };
  }
);

export const selectFeedbackSnapshot = {
  id: feedbacks.id,
  title: feedbacks.title,
  text: feedbacks.text,
  userId: feedbacks.userId,
  rating: feedbacks.rating,
  receivedAt: feedbacks.receivedAt
};
export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;
