import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

type CreateInput = {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
};
type UpdateInput = Partial<CreateInput>;

export const studyPlanService = {
  async list(userId: string) {
    return prisma.studyPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const plan = await prisma.studyPlan.findFirst({ where: { id, userId } });
    if (!plan) throw new AppError('Plano não encontrado', 404, 'PLAN_NOT_FOUND');
    return plan;
  },

  async create(userId: string, input: CreateInput) {
    if (input.endDate < input.startDate) {
      throw new AppError('endDate deve ser >= startDate', 400, 'INVALID_DATE_RANGE');
    }
    return prisma.studyPlan.create({ data: { ...input, userId } });
  },

  async update(id: string, userId: string, input: UpdateInput) {
    const existing = await this.getById(id, userId);
    const startDate = input.startDate ?? existing.startDate;
    const endDate = input.endDate ?? existing.endDate;

    if (endDate < startDate) {
      throw new AppError('endDate deve ser >= startDate', 400, 'INVALID_DATE_RANGE');
    }

    return prisma.studyPlan.update({ where: { id }, data: input });
  },

  async remove(id: string, userId: string) {
    await this.getById(id, userId);
    await prisma.studyPlan.delete({ where: { id } });
  },
};