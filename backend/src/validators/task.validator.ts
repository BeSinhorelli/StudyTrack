import { z } from 'zod';

const taskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  subjectId: z.string().optional().nullable(),
  title: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  subjectId: z.string().optional(),
  overdue: z.enum(['true', 'false']).optional(),
});