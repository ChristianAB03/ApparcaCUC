import { Schema, model, Document, Types } from 'mongoose';
import { TICKET_CATEGORIES, TicketCategory, TICKET_STATES, TicketState } from '../constants';
import { withJsonTransform } from '../utils/mongoose';

export interface ISupportTicket extends Document {
  _id: Types.ObjectId;
  code: string; // SUP-0001
  user: Types.ObjectId;
  userName: string; // denormalized for the admin list
  userEmail: string;
  category: TicketCategory;
  subject: string;
  message: string;
  reference?: string; // reservation code or space code, if any
  status: TicketState;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    code: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    category: { type: String, enum: TICKET_CATEGORIES, default: 'other' },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    reference: { type: String, trim: true, maxlength: 40 },
    status: { type: String, enum: TICKET_STATES, default: 'pending', index: true },
    adminNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

withJsonTransform(supportTicketSchema);

export const SupportTicket = model<ISupportTicket>('SupportTicket', supportTicketSchema);
