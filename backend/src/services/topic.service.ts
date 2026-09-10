import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import type { TopicStatus } from '../types/index.js';

type CreateInput = {
  subjectId: string;
  name: string;
  description?: string;
  status?: TopicStatus;
};
type UpdateInput = Partial<Omit<CreateInput, 'subjectId'>>;

async function ensureSubjectOwnership(subjectId: string, userId: string) {
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
  if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
}

export const topicService = {
  async list(userId: string, subjectId?: string) {
    return prisma.topic.findMany({
      where: {
        subject: { userId },
        ...(subjectId ? { subjectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const topic = await prisma.topic.findFirst({
      where: { id, subject: { userId } },
    });
    if (!topic) throw new AppError('Tópico não encontrado', 404, 'TOPIC_NOT_FOUND');
    return topic;
  },

  async create(userId: string, input: CreateInput) {
    await ensureSubjectOwnership(input.subjectId, userId);

    const exists = await prisma.topic.findFirst({
      where: { subjectId: input.subjectId, name: input.name },
    });
    if (exists) {
      throw new AppError('Já existe um tópico com esse nome nesta matéria', 409, 'TOPIC_NAME_IN_USE');
    }

    return prisma.topic.create({ data: input });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await this.getById(id, userId);
    return prisma.topic.update({ where: { id }, data: input });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.topic.delete({ where: { id } });
  },
};