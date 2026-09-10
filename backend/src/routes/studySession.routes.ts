import { Router } from 'express';
import { studySessionController } from '../controllers/studySession.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createStudySessionSchema,
  updateStudySessionSchema,
  listSessionsQuerySchema,
} from '../validators/studySession.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const studySessionRouter = Router();

studySessionRouter.get('/', validate({ query: listSessionsQuerySchema }), studySessionController.list);
studySessionRouter.post('/', validate({ body: createStudySessionSchema }), studySessionController.create);
studySessionRouter.get('/:id', validate({ params: idParamSchema }), studySessionController.get);
studySessionRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateStudySessionSchema }),
  studySessionController.update,
);
studySessionRouter.delete('/:id', validate({ params: idParamSchema }), studySessionController.remove);