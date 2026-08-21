import { JwtPayload } from '../utils/jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the `requireAuth` middleware after verifying the JWT. */
      user?: JwtPayload;
    }
  }
}

export {};
