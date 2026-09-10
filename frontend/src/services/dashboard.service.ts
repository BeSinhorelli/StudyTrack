import { api } from './api';
import type { ApiSuccess } from '../types/api';
import type { DashboardSummary, DashboardCharts, DashboardStats } from '../types/models';

export const dashboardService = {
  async summary(): Promise<DashboardSummary> {
    const { data } = await api.get<ApiSuccess<DashboardSummary>>('/dashboard/summary');
    return data.data;
  },

  async charts(): Promise<DashboardCharts> {
    const { data } = await api.get<ApiSuccess<DashboardCharts>>('/dashboard/charts');
    return data.data;
  },

  async stats(): Promise<DashboardStats> {
    const { data } = await api.get<ApiSuccess<DashboardStats>>('/dashboard/stats');
    return data.data;
  },
};