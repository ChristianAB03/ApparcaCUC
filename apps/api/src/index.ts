import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/db';
import { logger } from './utils/logger';
import { runSeedIfNeeded } from './seed/seed';
import { expireStaleReservations } from './services/reservation.service';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  if (env.seedOnStart) {
    await runSeedIfNeeded();
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`ApparcaCUC API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });

  // Self-healing demo: expire reservations whose window has passed.
  const interval = setInterval(() => {
    expireStaleReservations().catch((e) => logger.error('Expire task failed:', e));
  }, 60_000);
  interval.unref?.();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down…`);
    clearInterval(interval);
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error:', err);
  process.exit(1);
});
