import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type CreateInput = { name: string; description?: string; color?: string };
type UpdateInput = Partial<CreateInput>;

export const subjectService = {
  async list(userId: string) {
    return prisma.subject.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const subject = await prisma.subject.findFirst({ where: { id, userId } });
    if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
    return subject;
  },

  async create(userId: string, input: CreateInput) {
    const exists = await prisma.subject.findFirst({
      where: { userId, name: input.name },
    });
    if (exists) {
      throw new AppError('Já existe uma matéria com esse nome', 409, 'SUBJECT_NAME_IN_USE');
    }
    return prisma.subject.create({ data: { ...input, userId } });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await this.getById(id, userId);

    if (input.name) {
      const conflict = await prisma.subject.findFirst({
        where: { userId, name: input.name, NOT: { id } },
      });
      if (conflict) {
        throw new AppError('Já existe uma matéria com esse nome', 409, 'SUBJECT_NAME_IN_USE');
      }
    }

    return prisma.subject.update({ where: { id }, data: input });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);

    const sessionsCount = await prisma.studySession.count({ where: { subjectId: id } });
    if (sessionsCount > 0) {
      throw new AppError(
        'Não é possível excluir uma matéria com sessões de estudo registradas',
        409,
        'SUBJECT_HAS_SESSIONS',
      );
    }

    await prisma.subject.delete({ where: { id } });
  },
};