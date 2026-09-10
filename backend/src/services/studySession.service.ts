import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type CreateInput = {
  subjectId: string;
  topicId?: string | null;
  startedAt: Date;
  endedAt: Date;
  notes?: string;
};
type UpdateInput = Partial<CreateInput>;

const MAX_DURATION_MINUTES = 12 * 60;

function calculateDurationMinutes(startedAt: Date, endedAt: Date): number {
  const diffMs = endedAt.getTime() - startedAt.getTime();
  if (diffMs <= 0) {
    throw new AppError('endedAt deve ser posterior a startedAt', 400, 'INVALID_DATE_RANGE');
  }
  return Math.round(diffMs / 60000);
}

async function validateReferences(input: {
  userId: string;
  subjectId: string;
  topicId?: string | null;
}) {
  const subject = await prisma.subject.findFirst({
    where: { id: input.subjectId, userId: input.userId },
  });
  if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');

  if (input.topicId) {
    const topic = await prisma.topic.findFirst({
      where: { id: input.topicId, subjectId: input.subjectId },
    });
    if (!topic) {
      throw new AppError(
        'Tópico não encontrado ou não pertence à matéria informada',
        400,
        'TOPIC_SUBJECT_MISMATCH',
      );
    }
  }
}

export const studySessionService = {
  async list(
    userId: string,
    filters: { from?: Date; to?: Date; subjectId?: string },
  ) {
    return prisma.studySession.findMany({
      where: {
        userId,
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.from || filters.to
          ? {
              startedAt: {
                ...(filters.from ? { gte: filters.from } : {}),
                ...(filters.to ? { lte: filters.to } : {}),
              },
            }
          : {}),
      },
      orderBy: { startedAt: 'desc' },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
  },

  async getById(id: string, userId: string) {
    const session = await prisma.studySession.findFirst({
      where: { id, userId },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });
    if (!session) throw new AppError('Sessão não encontrada', 404, 'SESSION_NOT_FOUND');
    return session;
  },

  async create(userId: string, input: CreateInput) {
    await validateReferences({
      userId,
      subjectId: input.subjectId,
      topicId: input.topicId,
    });

    const durationMinutes = calculateDurationMinutes(input.startedAt, input.endedAt);

    if (durationMinutes > MAX_DURATION_MINUTES) {
      throw new AppError('Sessão não pode ter mais de 12 horas', 400, 'SESSION_TOO_LONG');
    }

    if (input.startedAt > new Date()) {
      throw new AppError('Sessão não pode começar no futuro', 400, 'SESSION_IN_FUTURE');
    }

    return prisma.studySession.create({
      data: { ...input, userId, durationMinutes },
    });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    const existing = await this.getById(id, userId);

    const subjectId = input.subjectId ?? existing.subjectId;
    const topicId = input.topicId !== undefined ? input.topicId : existing.topicId;

    await validateReferences({ userId, subjectId, topicId });

    const startedAt = input.startedAt ?? existing.startedAt;
    const endedAt = input.endedAt ?? existing.endedAt;
    const durationMinutes = calculateDurationMinutes(startedAt, endedAt);

    if (durationMinutes > MAX_DURATION_MINUTES) {
      throw new AppError('Sessão não pode ter mais de 12 horas', 400, 'SESSION_TOO_LONG');
    }

    return prisma.studySession.update({
      where: { id },
      data: { ...input, durationMinutes },
    });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.studySession.delete({ where: { id } });
  },
};