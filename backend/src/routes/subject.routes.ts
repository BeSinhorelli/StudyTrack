import { Router } from 'express';
import { subjectController } from '../controllers/subject.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createSubjectSchema,
  updateSubjectSchema,
  idParamSchema,
} from '../validators/subject.validator.js';

export const subjectRouter = Router();

subjectRouter.get('/', subjectController.list);
subjectRouter.post('/', validate({ body: createSubjectSchema }), subjectController.create);
subjectRouter.get('/:id', validate({ params: idParamSchema }), subjectController.get);
subjectRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateSubjectSchema }),
  subjectController.update,
);
subjectRouter.delete('/:id', validate({ params: idParamSchema }), subjectController.remove);