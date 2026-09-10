import type { Request, Response } from 'express';
import { studyPlanService } from '../services/studyPlan.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const studyPlanController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await studyPlanService.list(req.user!.id);
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await studyPlanService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await studyPlanService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await studyPlanService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await studyPlanService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};