import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';
import { ApiError } from '../utils/apiError';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates and coerces `body`, `query` and `params` against zod schemas.
 * On failure returns a 400 with field-level details. Schemas use `.strict()`
 * so unexpected/extra fields are rejected (mass-assignment protection).
 */
export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query) as never;
      if (schemas.params) req.params = schemas.params.parse(req.params) as never;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(ApiError.badRequest('Algunos datos no son válidos.', err.flatten().fieldErrors));
      } else {
        next(err);
      }
    }
  };
