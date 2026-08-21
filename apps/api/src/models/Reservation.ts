import { Schema, model, Document, Types } from 'mongoose';
import { RESERVATION_STATES, ReservationState } from '../constants';
import { withJsonTransform } from '../utils/mongoose';

export interface IReservation extends Document {
  _id: Types.ObjectId;
  code: string; // APC-2026-00021
  accessCode: string; // short code encoded in the QR
  user: Types.ObjectId;
  space: Types.ObjectId;
  spaceCode: string; // denormalized for history
  vehicle?: Types.ObjectId | null;
  vehiclePlate: string; // denormalized
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  state: ReservationState;
  checkInAt?: Date | null;
  checkOutAt?: Date | null;
  cancelledAt?: Date | null;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reservationSchema = new Schema<IReservation>(
  {
    code: { type: String, required: true, unique: true },
    accessCode: { type: String, required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    space: { type: Schema.Types.ObjectId, ref: 'ParkingSpace', required: true, index: true },
    spaceCode: { type: String, required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    vehiclePlate: { type: String, default: '', uppercase: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    state: { type: String, enum: RESERVATION_STATES, default: 'active', index: true },
    checkInAt: { type: Date, default: null },
    checkOutAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true },
);

reservationSchema.index({ user: 1, state: 1 });

withJsonTransform(reservationSchema);

export const Reservation = model<IReservation>('Reservation', reservationSchema);
