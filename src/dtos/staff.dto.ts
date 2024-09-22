import { z } from 'zod';

export const availableStaffsQuerySchema = z.object({
  date: z
    .string()
    .datetime()
    .refine((date) => {
      if (
        date < new Date().toISOString() ||
        date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      )
        return false;
      return true;
    }, 'Invalid date'),
  service_id: z.string({ required_error: 'Service id is not specified' })
});
