import { foreignKey, index, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';
import { createId } from '@paralleldrive/cuid2';

export const notifications = sqliteTable(
  'notifications',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description', { length: 400 }),
    receivedAt: text('received_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    entity: text('entity').notNull(),
    params: text('params')
  },
  function constraints(notifications) {
    return {
      primaryKey: primaryKey({ name: 'notifications_pkey', columns: [notifications.id] }),
      userReference: foreignKey({
        name: 'fk_user_id',
        columns: [notifications.userId],
        foreignColumns: [users.id]
      }),
      userIndex: index('user_idx').on(notifications.userId)
    };
  }
);

export const selectNotificationSnapshot = {
  id: notifications.id,
  title: notifications.title,
  description: notifications.description,
  receivedAt: notifications.receivedAt,
  entity: notifications.entity,
  params: notifications.params
};

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
