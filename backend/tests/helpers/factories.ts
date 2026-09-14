import bcrypt from 'bcrypt';
import { prisma } from '../../src/config/prisma.js';

const BCRYPT_ROUNDS = 4;

export async function createUser(overrides: Partial<{
  name: string;
  email: string;
  password: string;
}> = {}) {
  const name = overrides.name ?? 'Test User';
  const email = overrides.email ?? `user-${Date.now()}-${Math.random()}@test.com`;
  const password = overrides.password ?? 'senha1234';

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return { user, password };
}

export async function createSubject(userId: string, overrides: Partial<{
  name: string;
  color: string;
}> = {}) {
  return prisma.subject.create({
    data: {
      userId,
      name: overrides.name ?? 'TypeScript',
      color: overrides.color ?? '#3178c6',
    },
  });
}

export async function createTopic(subjectId: string, overrides: Partial<{
  name: string;
  status: string;
}> = {}) {
  return prisma.topic.create({
    data: {
      subjectId,
      name: overrides.name ?? 'Generics',
      status: overrides.status ?? 'NOT_STARTED',
    },
  });
}

export async function createSession(
  userId: string,
  subjectId: string,
  overrides: Partial<{
    topicId: string | null;
    startedAt: Date;
    endedAt: Date;
    durationMinutes: number;
  }> = {},
) {
  const startedAt = overrides.startedAt ?? new Date(Date.now() - 60 * 60 * 1000);
  const endedAt = overrides.endedAt ?? new Date();
  const durationMinutes =
    overrides.durationMinutes ??
    Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

  return prisma.studySession.create({
    data: {
      userId,
      subjectId,
      topicId: overrides.topicId ?? null,
      startedAt,
      endedAt,
      durationMinutes,
    },
  });
}

/**
 * Deleta tudo na ordem correta (mais dependente → menos dependente).
 * IMPORTANTE: a ordem é crítica por causa das FKs.
 */
export async function cleanDatabase() {
  await prisma.$transaction([
    prisma.studySession.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.note.deleteMany(),
    prisma.task.deleteMany(),
    prisma.topic.deleteMany(),
    prisma.studyPlan.deleteMany(),
    prisma.subject.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}