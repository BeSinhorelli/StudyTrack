import { z } from 'zod';

const topicStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);

export const createTopicSchema = z.object({
  subjectId: z.string().min(1),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  status: topicStatusSchema.optional(),
});

export const updateTopicSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  status: topicStatusSchema.optional(),
});

export const listTopicsQuerySchema = z.object({
  subjectId: z.string().optional(),
});