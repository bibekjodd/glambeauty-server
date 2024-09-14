import { createId } from '@paralleldrive/cuid2';
import { foreignKey, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';

export const appointments = sqliteTable(
  'appointments',
  {
    id: text('id').notNull().$defaultFn(createId),
    customer_id: text('customer_id').notNull(),
    service_id: text('service_id'),
    staff_id: text('staff_id').notNull(),
    date: text('staff_id').notNull(),
    status: text('staff_id', { enum: ['pending', 'completed', 'cancelled'] }).notNull(),
    cancelReason: text('cancel_reason'),
    isRescheduled: integer('is_rescheduled', { mode: 'boolean' }).default(false)
  },
  function (appointments) {
    return {
      primaryKey: primaryKey({ name: 'appointments_pkey', columns: [appointments.id] }),
      customerReference: foreignKey({
        name: 'fk_customer_id',
        columns: [appointments.customer_id],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade'),

      serviceReference: foreignKey({
        name: 'fk_service_id',
        columns: [appointments.service_id],
        foreignColumns: [users.id]
      })
        .onDelete('set null')
        .onUpdate('cascade'),

      staffReference: foreignKey({
        name: 'fk_staff_id',
        columns: [appointments.staff_id],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade'),

      customerIndex: index('customer_idx').on(appointments.customer_id),
      staffIndex: index('staff_idx').on(appointments.staff_id)
    };
  }
);

export const selectAppointmentSnapshot = {
  id: appointments.id,
  customer_id: appointments.customer_id,
  service_id: appointments.service_id,
  staff_id: appointments.staff_id,
  date: appointments.date,
  status: appointments.status,
  cancelReason: appointments.cancelReason,
  isRescheduled: appointments.isRescheduled
};

export type Appointment = {
  id: string;
  customer_id: string;
  service_id: string;
  staff_id: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  cancelReason: string | null;
  isRescheduled: boolean;
};
