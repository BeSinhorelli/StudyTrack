import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, corsOrigins } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  if (env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
      console.log(`[${req.method}] ${req.url}`);
      next();
    });
  }

  app.use(helmet());

  // Em dev, libera tudo (facilita hot reload, várias portas)
  // Em prod, usa whitelist do .env
  if (env.NODE_ENV === 'development') {
    app.use(cors({ origin: true, credentials: true }));
  } else {
    app.use(cors({ origin: corsOrigins, credentials: true }));
  }

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      data: { status: 'ok', timestamp: new Date().toISOString() },
    });
  });

  app.use('/api', apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada',
      code: 'NOT_FOUND',
    });
  });

  app.use(errorHandler);

  return app;
}