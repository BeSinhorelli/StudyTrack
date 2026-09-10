import { z } from 'zod';

export const createStudySessionSchema = z.object({
  subjectId: z.string().min(1),
  topicId: z.string().optional().nullable(),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  notes: z.string().max(1000).optional(),
});

export const updateStudySessionSchema = createStudySessionSchema.partial();

export const listSessionsQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  subjectId: z.string().optional(),
});