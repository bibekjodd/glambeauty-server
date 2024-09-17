import { z } from 'zod';
import { imageSchema } from './user.dto';

export const createServiceSchema = z.object({
  title: z.string().trim().min(4, 'Too short title').max(200, 'Too long service title'),
  description: z.string().trim().max(500, 'Too long description'),
  price: z
    .number()
    .min(500, 'Service charge must be minimum Rs. 500')
    .max(100_000, "Service charge can't exceed Rs. 1,00,000"),
  duration: z
    .number()
    .min(0.5, 'Service duration must be at least half hours')
    .max(12, "Service duration can't exceed 12 hours")
    .transform((val) => Math.round(val * 2) / 2),
  active: z.boolean().default(true),
  image: imageSchema.optional()
});
export const updateServiceSchema = createServiceSchema.partial();
