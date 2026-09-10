import type { Request, Response } from 'express';
import { taskService } from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { TaskStatus } from '../types/index.js';

export const taskController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { status, subjectId, overdue } = req.query as {
      status?: TaskStatus;
      subjectId?: string;
      overdue?: string;
    };
    const data = await taskService.list(req.user!.id, {
      status,
      subjectId,
      overdue: overdue === 'true',
    });
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await taskService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await taskService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await taskService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await taskService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};