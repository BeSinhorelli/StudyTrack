import { z } from 'zod';

const colorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createSubjectSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  color: z.string().regex(colorRegex, 'Cor deve ser HEX (#RRGGBB)').optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1) });