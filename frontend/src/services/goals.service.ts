import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { Goal } from '../types/models';

export type CreateGoalInput = {
  subjectId?: string | null;
  title: string;
  targetHours: number;
  deadline: string;
};

export type UpdateGoalInput = Partial<CreateGoalInput>;

export const goalsService = {
  async list(): Promise<Goal[]> {
    const { data } = await api.get<ApiSuccess<Goal[]>>('/goals');
    return data.data;
  },

  async getById(id: string): Promise<Goal> {
    const { data } = await api.get<ApiSuccess<Goal>>(`/goals/${id}`);
    return data.data;
  },

  async create(input: CreateGoalInput): Promise<Goal> {
    const { data } = await api.post<ApiSuccess<Goal>>('/goals', input);
    return data.data;
  },

  async update(id: string, input: UpdateGoalInput): Promise<Goal> {
    const { data } = await api.put<ApiSuccess<Goal>>(`/goals/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/goals/${id}`);
  },
};