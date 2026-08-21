import { Request, Response, NextFunction } from 'express';

/**
 * Recursively strips keys that could be interpreted as MongoDB operators
 * (keys starting with `$` or containing `.`). This blocks NoSQL-injection
 * payloads such as `{ "email": { "$gt": "" } }`. Zero-dependency and safe
 * with both Express 4 and 5.
 */
function scrub(value: unknown): void {
  if (!value || typeof value !== 'object') return;
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    const child = obj[key];
    if (child && typeof child === 'object') scrub(child);
  }
}

export function mongoSanitize(req: Request, _res: Response, next: NextFunction): void {
  scrub(req.body);
  scrub(req.query);
  scrub(req.params);
  next();
}
