import { Router } from 'express';
import { goalController } from '../controllers/goal.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createGoalSchema, updateGoalSchema } from '../validators/goal.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const goalRouter = Router();

goalRouter.get('/', goalController.list);
goalRouter.post('/', validate({ body: createGoalSchema }), goalController.create);
goalRouter.get('/:id', validate({ params: idParamSchema }), goalController.get);
goalRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateGoalSchema }),
  goalController.update,
);
goalRouter.delete('/:id', validate({ params: idParamSchema }), goalController.remove);