import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type CreateInput = {
  subjectId?: string | null;
  title: string;
  targetHours: number;
  deadline: Date;
};
type UpdateInput = Partial<CreateInput>;

async function calculateProgress(goal: {
  id: string;
  userId: string;
  subjectId: string | null;
  createdAt: Date;
  deadline: Date;
  targetHours: number;
}) {
  const sessions = await prisma.studySession.findMany({
    where: {
      userId: goal.userId,
      ...(goal.subjectId ? { subjectId: goal.subjectId } : {}),
      startedAt: { gte: goal.createdAt, lte: goal.deadline },
    },
    select: { durationMinutes: true },
  });

  const minutesStudied = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const hoursStudied = minutesStudied / 60;
  const progressPercent = Math.min(100, (hoursStudied / goal.targetHours) * 100);

  return {
    hoursStudied: Number(hoursStudied.toFixed(2)),
    progressPercent: Number(progressPercent.toFixed(1)),
    completed: hoursStudied >= goal.targetHours,
  };
}

export const goalService = {
  async list(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
    return Promise.all(goals.map(async (g) => ({ ...g, ...(await calculateProgress(g)) })));
  },

  async getById(id: string, userId: string) {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw new AppError('Meta não encontrada', 404, 'GOAL_NOT_FOUND');
    return { ...goal, ...(await calculateProgress(goal)) };
  },

  async create(userId: string, input: CreateInput) {
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, userId },
      });
      if (!subject) throw new AppError('Matéria não encontrada', 404, 'SUBJECT_NOT_FOUND');
    }

    if (input.deadline <= new Date()) {
      throw new AppError('Prazo deve ser futuro', 400, 'INVALID_DEADLINE');
    }

    const goal = await prisma.goal.create({ data: { ...input, userId } });
    return { ...goal, ...(await calculateProgress(goal)) };
  },

  async update(id: string, userId: string, input: UpdateInput) {
    await this.getById(id, userId);
    const goal = await prisma.goal.update({ where: { id }, data: input });
    return { ...goal, ...(await calculateProgress(goal)) };
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.goal.delete({ where: { id } });
  },
};