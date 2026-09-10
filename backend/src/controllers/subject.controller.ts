import type { Request, Response } from 'express';
import { subjectService } from '../services/subject.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const subjectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const data = await subjectService.list(req.user!.id);
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await subjectService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await subjectService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await subjectService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await subjectService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};