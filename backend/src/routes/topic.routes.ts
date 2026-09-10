import { Router } from 'express';
import { topicController } from '../controllers/topic.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTopicSchema,
  updateTopicSchema,
  listTopicsQuerySchema,
} from '../validators/topic.validator.js';
import { idParamSchema } from '../validators/subject.validator.js';

export const topicRouter = Router();

topicRouter.get('/', validate({ query: listTopicsQuerySchema }), topicController.list);
topicRouter.post('/', validate({ body: createTopicSchema }), topicController.create);
topicRouter.get('/:id', validate({ params: idParamSchema }), topicController.get);
topicRouter.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTopicSchema }),
  topicController.update,
);
topicRouter.delete('/:id', validate({ params: idParamSchema }), topicController.remove);