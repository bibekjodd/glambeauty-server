import { createId } from '@paralleldrive/cuid2';
import { alias, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

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
    address: text('address'),
    active: integer('active', { mode: 'boolean' }).notNull().default(true)
  },
  function constraints(users) {
    return {
      primaryKey: primaryKey({ name: 'users_pkey', columns: [users.id] }),
      uniqueEmail: unique('email').on(users.email)
    };
  }
);
export const customers = alias(users, 'customers');

export const selectUserSnapshot = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  role: users.role,
  phone: users.phone,
  address: users.address,
  active: users.active
};
export const selectCustomerSnapshot = {
  id: customers.id,
  name: customers.name,
  email: customers.email,
  image: customers.image,
  role: customers.role,
  phone: customers.phone,
  address: customers.address,
  active: customers.active
};
export type UserRole = 'user' | 'staff' | 'admin';
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
