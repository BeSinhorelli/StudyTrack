import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const BCRYPT_ROUNDS = 12;

type RegisterInput = { name: string; email: string; password: string };
type LoginInput = { email: string; password: string };

type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function signToken(userId: string, email: string): string {
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Email já cadastrado', 409, 'EMAIL_IN_USE');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, passwordHash },
    });

    return { user: toPublicUser(user), token: signToken(user.id, user.email) };
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError('Credenciais inválidas', 401, 'INVALID_CREDENTIALS');
    }

    return { user: toPublicUser(user), token: signToken(user.id, user.email) };
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    return toPublicUser(user);
  },
};