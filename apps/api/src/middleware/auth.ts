import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

/**
 * Verifies the `Authorization: Bearer <token>` header and attaches the
 * decoded payload to `req.user`. Rejects when missing or invalid.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized();
  }
  const token = header.slice(7).trim();
  try {
    req.user = verifyToken(token);
  } catch {
    throw ApiError.unauthorized('Tu sesión es inválida o expiró. Inicia sesión de nuevo.');
  }
  next();
}

/**
 * Requires an authenticated admin. Must run AFTER `requireAuth`.
 * This is the real authorization gate — the frontend hiding admin UI is
 * never trusted; every admin route is protected here on the server.
 */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) throw ApiError.unauthorized();
  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Esta acción requiere privilegios de administrador.');
  }
  next();
}
