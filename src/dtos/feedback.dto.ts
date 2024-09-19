import { z } from 'zod';

export const postFeedbackSchema = z.object({
  title: z.string().max(100, 'Too long feedback title').trim(),
  text: z.string().max(400, 'Too long feedback text'),
  rating: z.number().min(1).max(5)
});

export const getFeedbacksQuerySchema = z.object({
  cursor: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  limit: z.preprocess((val) => Number(val) || 20, z.number().min(1).max(20)),
  rating: z.preprocess(
    (val) => Number(val) || undefined,
    z
      .number()
      .min(1)
      .max(5)
      .transform((val) => Math.floor(val))
      .optional()
  )
});
