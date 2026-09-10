import { z } from 'zod';

export const createGoalSchema = z.object({
  subjectId: z.string().optional().nullable(),
  title: z.string().min(2).max(120),
  targetHours: z.number().positive(),
  deadline: z.coerce.date(),
});

export const updateGoalSchema = createGoalSchema.partial();