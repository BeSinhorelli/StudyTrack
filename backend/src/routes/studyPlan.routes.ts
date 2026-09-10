import { Router } from 'express';
import { studyPlanController } from '../controllers/studyPlan.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createStudyPlanSchema,
  updateStudyPlanSchema,
} from '../validators/studyPlan.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const studyPlanRouter = Router();

studyPlanRouter.get('/', studyPlanController.list);
studyPlanRouter.post('/', validate({ body: createStudyPlanSchema }), studyPlanController.create);
studyPlanRouter.get('/:id', validate({ params: idParamSchema }), studyPlanController.get);
studyPlanRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateStudyPlanSchema }),
  studyPlanController.update,
);
studyPlanRouter.delete('/:id', validate({ params: idParamSchema }), studyPlanController.remove);