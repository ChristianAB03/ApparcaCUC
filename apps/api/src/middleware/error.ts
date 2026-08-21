import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound('La ruta solicitada no existe.'));
}

/**
 * Centralized error handler. Converts any thrown error into a clean JSON
 * response. Never leaks stack traces or internal details in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  let apiErr: ApiError;

  if (err instanceof ApiError) {
    apiErr = err;
  } else if (isMongoDuplicate(err)) {
    apiErr = ApiError.conflict('Ya existe un registro con esos datos.');
  } else if (isCastError(err)) {
    apiErr = ApiError.badRequest('El identificador proporcionado no es válido.');
  } else {
    apiErr = ApiError.internal();
    logger.error('Unhandled error:', err instanceof Error ? err.stack : err);
  }

  const errorBody: Record<string, unknown> = { code: apiErr.code, message: apiErr.message };
  if (apiErr.details) errorBody.details = apiErr.details;
  // Expose stack traces only in development, and only for unexpected errors.
  if (env.isDev && !(err instanceof ApiError) && err instanceof Error) {
    errorBody.stack = err.stack;
  }

  res.status(apiErr.statusCode).json({ error: errorBody });
}

function isMongoDuplicate(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}

function isCastError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: string }).name === 'CastError';
}
