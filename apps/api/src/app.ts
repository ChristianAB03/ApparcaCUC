import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes';
import { env } from './config/env';
import { mongoSanitize } from './middleware/mongoSanitize';
import { generalLimiter } from './middleware/rateLimit';
import { notFound, errorHandler } from './middleware/error';

export function createApp() {
  const app = express();

  // Behind a proxy in production (Render/Railway) so rate-limit sees real IPs.
  if (env.isProd) app.set('trust proxy', 1);

  // Security headers.
  app.use(helmet());

  // CORS — only the configured client origin(s) may call the API from a browser.
  app.use(
    cors({
      origin(origin, cb) {
        // Allow tools with no Origin (curl, health checks) and configured origins.
        if (!origin || env.clientOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );

  // Body parsing with a strict size limit.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  // Strip MongoDB operator keys from all input (NoSQL-injection protection).
  app.use(mongoSanitize);

  if (!env.isProd) app.use(morgan('dev'));

  app.get('/', (_req, res) => {
    res.json({ service: 'ApparcaCUC API', health: '/api/health' });
  });

  app.use('/api', generalLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
