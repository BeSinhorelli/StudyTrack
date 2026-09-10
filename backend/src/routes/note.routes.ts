import { Router } from 'express';
import { noteController } from '../controllers/note.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createNoteSchema, updateNoteSchema, listNotesQuerySchema } from '../validators/note.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const noteRouter = Router();

noteRouter.get('/', validate({ query: listNotesQuerySchema }), noteController.list);
noteRouter.post('/', validate({ body: createNoteSchema }), noteController.create);
noteRouter.get('/:id', validate({ params: idParamSchema }), noteController.get);
noteRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateNoteSchema }),
  noteController.update,
);
noteRouter.delete('/:id', validate({ params: idParamSchema }), noteController.remove);