import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { Subject } from '../types/models';

export type CreateSubjectInput = {
  name: string;
  description?: string;
  color?: string;
};

export type UpdateSubjectInput = Partial<CreateSubjectInput>;

export const subjectsService = {
  async list(): Promise<Subject[]> {
    const { data } = await api.get<ApiSuccess<Subject[]>>('/subjects');
    return data.data;
  },

  async getById(id: string): Promise<Subject> {
    const { data } = await api.get<ApiSuccess<Subject>>(`/subjects/${id}`);
    return data.data;
  },

  async create(input: CreateSubjectInput): Promise<Subject> {
    const { data } = await api.post<ApiSuccess<Subject>>('/subjects', input);
    return data.data;
  },

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const { data } = await api.put<ApiSuccess<Subject>>(`/subjects/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/subjects/${id}`);
  },
};