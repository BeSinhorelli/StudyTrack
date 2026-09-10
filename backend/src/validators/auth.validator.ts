import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter uma letra')
    .regex(/[0-9]/, 'Senha deve conter um número'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});