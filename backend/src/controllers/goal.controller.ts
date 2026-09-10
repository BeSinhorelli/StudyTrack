import type { Request, Response } from 'express';
import { goalService } from '../services/goal.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const goalController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await goalService.list(req.user!.id);
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await goalService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await goalService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await goalService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await goalService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};