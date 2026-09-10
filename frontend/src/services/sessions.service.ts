import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { StudySession } from '../types/models';

export type CreateSessionInput = {
  subjectId: string;
  topicId?: string | null;
  startedAt: string;
  endedAt: string;
  notes?: string;
};

export type UpdateSessionInput = Partial<CreateSessionInput>;

export type SessionFilters = {
  from?: string;
  to?: string;
  subjectId?: string;
};

export const sessionsService = {
  async list(filters: SessionFilters = {}): Promise<StudySession[]> {
    const { data } = await api.get<ApiSuccess<StudySession[]>>('/study-sessions', {
      params: {
        ...(filters.from ? { from: filters.from } : {}),
        ...(filters.to ? { to: filters.to } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
      },
    });
    return data.data;
  },

  async getById(id: string): Promise<StudySession> {
    const { data } = await api.get<ApiSuccess<StudySession>>(`/study-sessions/${id}`);
    return data.data;
  },

  async create(input: CreateSessionInput): Promise<StudySession> {
    const { data } = await api.post<ApiSuccess<StudySession>>('/study-sessions', input);
    return data.data;
  },

  async update(id: string, input: UpdateSessionInput): Promise<StudySession> {
    const { data } = await api.put<ApiSuccess<StudySession>>(`/study-sessions/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/study-sessions/${id}`);
  },
};