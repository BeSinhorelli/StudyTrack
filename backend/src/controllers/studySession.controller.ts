import type { Request, Response } from 'express';
import { studySessionService } from '../services/studySession.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const studySessionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { from, to, subjectId } = req.query as {
      from?: Date;
      to?: Date;
      subjectId?: string;
    };
    const data = await studySessionService.list(req.user!.id, { from, to, subjectId });
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await studySessionService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await studySessionService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await studySessionService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await studySessionService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};