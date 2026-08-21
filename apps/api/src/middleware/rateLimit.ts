import rateLimit from 'express-rate-limit';

const message = (msg: string) => ({ error: { code: 'TOO_MANY_REQUESTS', message: msg } });

/** Broad limiter applied to the whole API. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Demasiadas solicitudes. Intenta de nuevo en unos minutos.'),
});

/** Stricter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Demasiados intentos de autenticación. Espera unos minutos.'),
});
