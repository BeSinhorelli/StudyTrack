import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { Topic, TopicStatus } from '../types/models';

export type CreateTopicInput = {
  subjectId: string;
  name: string;
  description?: string;
  status?: TopicStatus;
};

export type UpdateTopicInput = Partial<Omit<CreateTopicInput, 'subjectId'>>;

export const topicsService = {
  async list(subjectId?: string): Promise<Topic[]> {
    const { data } = await api.get<ApiSuccess<Topic[]>>('/topics', {
      params: subjectId ? { subjectId } : {},
    });
    return data.data;
  },

  async getById(id: string): Promise<Topic> {
    const { data } = await api.get<ApiSuccess<Topic>>(`/topics/${id}`);
    return data.data;
  },

  async create(input: CreateTopicInput): Promise<Topic> {
    const { data } = await api.post<ApiSuccess<Topic>>('/topics', input);
    return data.data;
  },

  async update(id: string, input: UpdateTopicInput): Promise<Topic> {
    const { data } = await api.put<ApiSuccess<Topic>>(`/topics/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/topics/${id}`);
  },
};