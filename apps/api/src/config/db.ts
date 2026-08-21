import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let memoryServer: { stop: () => Promise<unknown> } | null = null;

/**
 * Connects to MongoDB.
 * - If MONGODB_URI is set, connects to that (e.g. MongoDB Atlas).
 * - If it is empty AND we are not in production, spins up an in-memory
 *   MongoDB so the demo runs with zero external setup.
 */
export async function connectDatabase(): Promise<void> {
  let uri = env.MONGODB_URI;

  if (!uri) {
    if (env.isProd) {
      throw new Error('MONGODB_URI is required in production.');
    }
    logger.info('No MONGODB_URI set — starting in-memory MongoDB (demo mode)…');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    memoryServer = mem;
    uri = mem.getUri();
  }

  mongoose.set('strictQuery', true);
  mongoose.connection.on('error', (err) => logger.error('MongoDB connection error:', err.message));

  await mongoose.connect(uri, { dbName: 'apparcacuc' });
  logger.info(`MongoDB connected (${memoryServer ? 'in-memory demo' : 'remote'}).`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

export function isMemoryDatabase(): boolean {
  return memoryServer !== null;
}
