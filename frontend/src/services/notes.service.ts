import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { Note } from '../types/models';

export type CreateNoteInput = {
  subjectId?: string | null;
  topicId?: string | null;
  title: string;
  content: string;
};

export type UpdateNoteInput = Partial<CreateNoteInput>;

export type NoteFilters = {
  subjectId?: string;
  topicId?: string;
};

export const notesService = {
  async list(filters: NoteFilters = {}): Promise<Note[]> {
    const { data } = await api.get<ApiSuccess<Note[]>>('/notes', {
      params: {
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.topicId ? { topicId: filters.topicId } : {}),
      },
    });
    return data.data;
  },

  async getById(id: string): Promise<Note> {
    const { data } = await api.get<ApiSuccess<Note>>(`/notes/${id}`);
    return data.data;
  },

  async create(input: CreateNoteInput): Promise<Note> {
    const { data } = await api.post<ApiSuccess<Note>>('/notes', input);
    return data.data;
  },

  async update(id: string, input: UpdateNoteInput): Promise<Note> {
    const { data } = await api.put<ApiSuccess<Note>>(`/notes/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
};