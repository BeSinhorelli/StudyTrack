import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { Task, TaskStatus, TaskPriority } from '../types/models';

export type CreateTaskInput = {
  subjectId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type TaskFilters = {
  status?: TaskStatus;
  subjectId?: string;
  overdue?: boolean;
};

export const tasksService = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const { data } = await api.get<ApiSuccess<Task[]>>('/tasks', {
      params: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.subjectId ? { subjectId: filters.subjectId } : {}),
        ...(filters.overdue ? { overdue: 'true' } : {}),
      },
    });
    return data.data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get<ApiSuccess<Task>>(`/tasks/${id}`);
    return data.data;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const { data } = await api.post<ApiSuccess<Task>>('/tasks', input);
    return data.data;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await api.put<ApiSuccess<Task>>(`/tasks/${id}`, input);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};