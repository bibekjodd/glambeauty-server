import { createId } from '@paralleldrive/cuid2';
import { foreignKey, index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';
import { services } from './service.schema';

export const appointments = sqliteTable(
  'appointments',
  {
    id: text('id').notNull().$defaultFn(createId),
    customerId: text('customer_id').notNull(),
    serviceId: text('service_id'),
    staffId: text('staff_id').notNull(),
    startsAt: text('starts_at').notNull(),
    endsAt: text('ends_at').notNull(),
    status: text('status', { enum: ['pending', 'completed', 'cancelled'] }).notNull(),
    cancelReason: text('cancel_reason'),
    isRescheduled: integer('is_rescheduled', { mode: 'boolean' }).default(false),
    bookedAt: text('booked_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  function (appointments) {
    return {
      primaryKey: primaryKey({ name: 'appointments_pkey', columns: [appointments.id] }),
      customerReference: foreignKey({
        name: 'fk_customer_id',
        columns: [appointments.customerId],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade'),

      serviceReference: foreignKey({
        name: 'fk_service_id',
        columns: [appointments.serviceId],
        foreignColumns: [services.id]
      })
        .onDelete('set null')
        .onUpdate('cascade'),

      staffReference: foreignKey({
        name: 'fk_staff_id',
        columns: [appointments.staffId],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade'),

      customerIndex: index('customer_idx').on(appointments.customerId),
      staffIndex: index('staff_idx').on(appointments.staffId)
    };
  }
);

export const selectAppointmentSnapshot = {
  id: appointments.id,
  customerId: appointments.customerId,
  serviceId: appointments.serviceId,
  staffId: appointments.staffId,
  startsAt: appointments.startsAt,
  endsAt: appointments.endsAt,
  status: appointments.status,
  cancelReason: appointments.cancelReason,
  isRescheduled: appointments.isRescheduled,
  bookedAt: appointments.bookedAt
};

export const selectAppointmentsStats = {
  id: appointments.id,
  status: appointments.status,
  startsAt: appointments.startsAt,
  endsAt: appointments.endsAt,
  bookedAt: appointments.bookedAt
};

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';
export type AppointmentStats = {
  id: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  bookedAt: string;
};
