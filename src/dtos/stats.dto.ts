import { z } from 'zod';

export const getDashboardStatsQuerySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  limit: z.preprocess((val) => Number(val) || 20, z.number().min(1))
});

export type GetDashBoardStatsQuerySchema = z.infer<typeof getDashboardStatsQuerySchema>;

export const getAllDashboardStatsQuerySchema = z.object({
  appointmentsStart: z.string().datetime(),
  appointmentsEnd: z.string().datetime(),
  bookingsStart: z.string().datetime(),
  bookingsEnd: z.string().datetime(),
  limit: z.preprocess((val) => Number(val) || 20, z.number().min(1))
});
