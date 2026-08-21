import { env } from '../config/env';

type Level = 'info' | 'warn' | 'error' | 'debug';

const tags: Record<Level, string> = { info: 'ℹ️ ', warn: '⚠️ ', error: '❌', debug: '🐛' };

function emit(level: Level, args: unknown[]): void {
  if (level === 'debug' && env.isProd) return;
  const ts = new Date().toISOString();
  const fn = level === 'debug' ? console.log : console[level];
  // eslint-disable-next-line no-console
  (fn as (...a: unknown[]) => void)(`${ts} ${tags[level]}`, ...args);
}

export const logger = {
  info: (...a: unknown[]) => emit('info', a),
  warn: (...a: unknown[]) => emit('warn', a),
  error: (...a: unknown[]) => emit('error', a),
  debug: (...a: unknown[]) => emit('debug', a),
};
