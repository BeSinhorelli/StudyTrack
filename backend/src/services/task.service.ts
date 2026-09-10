import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { TaskStatus, TaskPriority } from '../types/index.js';

type CreateInput = {
  subjectId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
};
type UpdateInput = Partial<CreateInput>;

export const taskService = {
  async list(
    userId: string,
    filters: { status?: TaskStatus; subjectId?: string; overdue?: boolean },
  ) {
    const now = new Date();
    return prisma.task.findMany({
      where: {
        userId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.overdue
          ? {
              dueDate: { lt: now },
              status: { notIn: ['COMPLETED', 'CANCELLED'] },
            }
          : {}),
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  },

  async getById(id: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new AppError('Tarefa não encontrada', 404, 'TASK_NOT_FOUND');
    return task;
  },

  async create(userId: string, input: CreateInput) {
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
    }

    if (input.dueDate && input.dueDate < new Date()) {
      throw new AppError('Data de vencimento deve ser futura', 400, 'INVALID_DUE_DATE');
    }

    return prisma.task.create({ data: { ...input, userId } });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await this.getById(id, userId);

    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
    }

    return prisma.task.update({ where: { id }, data: input });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.task.delete({ where: { id } });
  },
};