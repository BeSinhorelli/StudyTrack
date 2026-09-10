import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.summary(req.user!.id);
    res.json({ success: true, data });
  }),
  charts: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.charts(req.user!.id);
    res.json({ success: true, data });
  }),
  stats: asyncHandler(async (req: Request, res: Response) => {
    const data = await dashboardService.stats(req.user!.id);
    res.json({ success: true, data });
  }),
};