import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type CreateInput = {
  subjectId?: string | null;
  topicId?: string | null;
  title: string;
  content: string;
};
type UpdateInput = Partial<CreateInput>;

async function validateLinks(userId: string, subjectId?: string | null, topicId?: string | null) {
  if (subjectId) {
    const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId } });
    if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
  }

  if (topicId) {
    if (!subjectId) {
      throw new AppError('topicId requer subjectId', 400, 'TOPIC_REQUIRES_SUBJECT');
    }
    const topic = await prisma.topic.findFirst({
      where: { id: topicId, subjectId },
    });
    if (!topic) throw new AppError('Tópico não pertence à matéria', 400, 'TOPIC_SUBJECT_MISMATCH');
  }
}

export const noteService = {
  async list(userId: string, filters: { subjectId?: string; topicId?: string }) {
    return prisma.note.findMany({
      where: {
        userId,
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.topicId ? { topicId: filters.topicId } : {}),
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const note = await prisma.note.findFirst({ where: { id, userId } });
    if (!note) throw new AppError('Anotação não encontrada', 404, 'NOTE_NOT_FOUND');
    return note;
  },

  async create(userId: string, input: CreateInput) {
    await validateLinks(userId, input.subjectId, input.topicId);
    return prisma.note.create({ data: { ...input, userId } });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    const existing = await this.getById(id, userId);
    await validateLinks(
      userId,
      input.subjectId !== undefined ? input.subjectId : existing.subjectId,
      input.topicId !== undefined ? input.topicId : existing.topicId,
    );
    return prisma.note.update({ where: { id }, data: input });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.note.delete({ where: { id } });
  },
};