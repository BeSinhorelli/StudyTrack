import type { Request, Response } from 'express';
import { topicService } from '../services/topic.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const topicController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { subjectId } = req.query as { subjectId?: string };
    const data = await topicService.list(req.user!.id, subjectId);
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await topicService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await topicService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await topicService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await topicService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};