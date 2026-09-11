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

export const updateMeSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Nova senha deve conter uma letra')
    .regex(/[0-9]/, 'Nova senha deve conter um número'),
});