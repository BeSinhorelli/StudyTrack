import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} from '../validators/task.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const taskRouter = Router();

taskRouter.get('/', validate({ query: listTasksQuerySchema }), taskController.list);
taskRouter.post('/', validate({ body: createTaskSchema }), taskController.create);
taskRouter.get('/:id', validate({ params: idParamSchema }), taskController.get);
taskRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  taskController.update,
);
taskRouter.delete('/:id', validate({ params: idParamSchema }), taskController.remove);