import { Schema, model, Document, Types } from 'mongoose';
import { withJsonTransform } from '../utils/mongoose';

export type ActorType = 'admin' | 'sensor' | 'user' | 'system';

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  actor?: Types.ObjectId | null;
  actorType: ActorType;
  actorLabel: string; // human-readable, e.g. "Sensor A-04" or admin name
  action: string; // e.g. "space.state_change"
  target: string; // e.g. "A-04"
  from?: string;
  to?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    actorType: { type: String, enum: ['admin', 'sensor', 'user', 'system'], default: 'system' },
    actorLabel: { type: String, default: 'system' },
    action: { type: String, required: true, index: true },
    target: { type: String, required: true },
    from: { type: String },
    to: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

withJsonTransform(auditLogSchema);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
