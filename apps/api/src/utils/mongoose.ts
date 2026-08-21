import { Schema } from 'mongoose';

/**
 * Applies a consistent JSON serialization to a schema:
 * - exposes `id` (string) instead of `_id`
 * - removes the version key and any `passwordHash`
 * This keeps API responses clean and prevents leaking sensitive fields.
 */
export function withJsonTransform<T>(schema: Schema<T>): Schema<T> {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    },
  });
  return schema;
}
