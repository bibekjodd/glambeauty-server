import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(4, 'Too short title').max(200, 'Too long service title'),
  price: z
    .number()
    .min(500, 'Service charge must be minimum Rs. 500')
    .max(100_000, "Service charge can't exceed Rs. 1,00,000"),
  duration: z
    .number()
    .min(0.5, 'Service duration must be at least half hours')
    .max(12, "Service duration can't exceed 6 hours")
    .transform((val) => Math.round(val * 2) / 4),
  active: z.boolean()
});
export const updateServiceSchema = createServiceSchema;
