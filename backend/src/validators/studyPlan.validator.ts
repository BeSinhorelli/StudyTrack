import { z } from 'zod';

export const createStudyPlanSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const updateStudyPlanSchema = createStudyPlanSchema.partial();