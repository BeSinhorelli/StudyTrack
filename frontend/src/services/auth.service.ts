import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { AuthResponse, User } from '../types/models';

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
export type UpdateMeInput = { name?: string; email?: string };
export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/login', input);
    return data.data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<ApiSuccess<AuthResponse>>('/auth/register', input);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiSuccess<User>>('/auth/me');
    return data.data;
  },

  async updateMe(input: UpdateMeInput): Promise<User> {
    const { data } = await api.patch<ApiSuccess<User>>('/auth/me', input);
    return data.data;
  },

  async changePassword(input: ChangePasswordInput): Promise<void> {
    await api.patch('/auth/me/password', input);
  },
};