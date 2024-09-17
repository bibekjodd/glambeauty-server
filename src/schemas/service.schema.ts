import { createId } from '@paralleldrive/cuid2';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const services = sqliteTable(
  'services',
  {
    id: text('id').notNull().$defaultFn(createId),
    title: text('title').notNull(),
    price: integer('price').notNull(),
    image: text('image', { length: 200 }),
    description: text('description', { length: 500 }).notNull(),
    duration: integer('duration').notNull(),
    active: integer('active', { mode: 'boolean' }).default(true)
  },
  function constraints(services) {
    return {
      primaryKey: primaryKey({ name: 'services_pkey', columns: [services.id] })
    };
  }
);

export const selectServicesSnapshot = {
  id: services.id,
  title: services.title,
  image: services.image,
  description: services.duration,
  price: services.price,
  duration: services.duration,
  active: services.active
};

export type Service = typeof services.$inferSelect;
