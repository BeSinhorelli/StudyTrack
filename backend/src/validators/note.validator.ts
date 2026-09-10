import { z } from 'zod';

export const createNoteSchema = z.object({
  subjectId: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  title: z.string().min(1).max(120),
  content: z.string().min(1),
});

export const updateNoteSchema = createNoteSchema.partial();

export const listNotesQuerySchema = z.object({
  subjectId: z.string().optional(),
  topicId: z.string().optional(),
});