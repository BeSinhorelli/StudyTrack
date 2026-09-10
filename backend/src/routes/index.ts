import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRouter } from './auth.routes.js';
import { subjectRouter } from './subject.routes.js';
import { topicRouter } from './topic.routes.js';
import { taskRouter } from './task.routes.js';
import { studySessionRouter } from './studySession.routes.js';
import { goalRouter } from './goal.routes.js';
import { noteRouter } from './note.routes.js';
import { studyPlanRouter } from './studyPlan.routes.js';
import { dashboardRouter } from './dashboard.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);

apiRouter.use(authenticate);

apiRouter.use('/subjects', subjectRouter);
apiRouter.use('/topics', topicRouter);
apiRouter.use('/tasks', taskRouter);
apiRouter.use('/study-sessions', studySessionRouter);
apiRouter.use('/goals', goalRouter);
apiRouter.use('/notes', noteRouter);
apiRouter.use('/study-plans', studyPlanRouter);
apiRouter.use('/dashboard', dashboardRouter);