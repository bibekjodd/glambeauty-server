import { createId } from '@paralleldrive/cuid2';
import { integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').notNull().$defaultFn(createId),
    name: text('name', { length: 50 }).notNull(),
    email: text('email', { length: 50 }).notNull(),
    image: text('image'),
    role: text('role', { enum: ['user', 'admin', 'staff'] })
      .notNull()
      .default('user'),
    phone: integer('phone'),
    address: text('address')
  },
  function constraints(users) {
    return {
      primaryKey: primaryKey({ name: 'users_pkey', columns: [users.id] }),
      uniqueEmail: unique('email').on(users.email)
    };
  }
);

export type User = typeof users.$inferSelect;
export const selectUserSnapshot = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  role: users.role,
  phone: users.phone,
  address: users.address
};
export type UserSnapshot = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  phone: number | null;
  address: string | null;
};
