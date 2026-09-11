import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente mais tarde.',
    code: 'RATE_LIMIT',
  },
});

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
authRouter.get('/me', authenticate, authController.me);
authRouter.patch(
  '/me',
  authenticate,
  validate({ body: updateMeSchema }),
  authController.updateMe,
);
authRouter.patch(
  '/me/password',
  authenticate,
  validate({ body: changePasswordSchema }),
  authController.changePassword,
);