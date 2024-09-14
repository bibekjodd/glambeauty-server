import { createId } from '@paralleldrive/cuid2';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const services = sqliteTable(
  'services',
  {
    id: text('id').notNull().$defaultFn(createId),
    title: text('title').notNull(),
    price: integer('price').notNull(),
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
  price: services.price,
  duration: services.duration,
  active: services.active
};

export type Service = {
  id: string;
  title: string;
  price: number;
  duration: number;
  active: boolean;
};
