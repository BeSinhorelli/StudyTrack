import type { Request, Response } from 'express';
import { noteService } from '../services/note.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const noteController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { subjectId, topicId } = req.query as { subjectId?: string; topicId?: string };
    const data = await noteService.list(req.user!.id, { subjectId, topicId });
    res.json({ success: true, data });
  }),
  get: asyncHandler(async (req: Request, res: Response) => {
    const data = await noteService.getById(req.params.id!, req.user!.id);
    res.json({ success: true, data });
  }),
  create: asyncHandler(async (req: Request, res: Response) => {
    const data = await noteService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data });
  }),
  update: asyncHandler(async (req: Request, res: Response) => {
    const data = await noteService.update(req.params.id!, req.user!.id, req.body);
    res.json({ success: true, data });
  }),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await noteService.remove(req.params.id!, req.user!.id);
    res.status(204).send();
  }),
};