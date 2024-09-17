import { z } from 'zod';

export const registerAppointmentSchema = z.object({
  staffId: z.string(),
  serviceId: z.string(),
  date: z
    .string()
    .datetime()
    .refine((date) => {
      const nextMonth = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
      nextMonth.setHours(0);
      nextMonth.setSeconds(0);
      nextMonth.setMilliseconds(0);
      if (date < new Date().toISOString() || date > nextMonth.toISOString()) return false;
      return true;
    }, 'Invalid date selected')
});
export type RegisterAppointmentSchema = z.infer<typeof registerAppointmentSchema>;

export const getAppointmentsQuerySchema = z.object({
  cursor: z
    .string()
    .datetime()
    .default(() => {
      const date = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
      return date.toISOString();
    })
});

export const getAdminAppointmentsQuerySchema = getAppointmentsQuerySchema.extend({
  user_id: z.string().optional()
});
