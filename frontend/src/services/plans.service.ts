import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { StudyPlan } from '../types/models';

export type CreatePlanInput = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type UpdatePlanInput = Partial<CreatePlanInput>;

export const plansService = {
  async list(): Promise<StudyPlan[]> {
    const { data } = await api.get<ApiSuccess<StudyPlan[]>>('/study-plans');
    return data.data;
  },

  async getById(id: string): Promise<StudyPlan> {
    const { data } = await api.get<ApiSuccess<StudyPlan>>(`/study-plans/${id}`);
    return data.data;
  },

  async create(input: CreatePlanInput): Promise<StudyPlan> {
    const { data } = await api.post<ApiSuccess<StudyPlan>>('/study-plans', input);
    return data.data;
  },

  async update(id: string, input: UpdatePlanInput): Promise<StudyPlan> {
    const { data } = await api.put<ApiSuccess<StudyPlan>>(`/study-plans/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/study-plans/${id}`);
  },
};