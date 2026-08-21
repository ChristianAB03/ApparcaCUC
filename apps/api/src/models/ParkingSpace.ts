import { Schema, model, Document, Types } from 'mongoose';
import {
  PARKING_STATES,
  ParkingState,
  SPACE_TYPES,
  SpaceType,
  PARKING_ZONES,
  ParkingZone,
} from '../constants';
import { withJsonTransform } from '../utils/mongoose';

export interface IParkingSpace extends Document {
  _id: Types.ObjectId;
  code: string; // e.g. "A-01"
  zone: ParkingZone;
  position: number; // ordering within the zone
  type: SpaceType;
  state: ParkingState;
  level: number;
  sensorId: string; // simulated IoT sensor identifier
  note?: string;
  currentReservation?: Types.ObjectId | null;
  lastStateChangeAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const parkingSpaceSchema = new Schema<IParkingSpace>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    zone: { type: String, enum: PARKING_ZONES, required: true, index: true },
    position: { type: Number, required: true },
    type: { type: String, enum: SPACE_TYPES, default: 'standard' },
    state: { type: String, enum: PARKING_STATES, default: 'available', index: true },
    level: { type: Number, default: 1 },
    sensorId: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 160 },
    currentReservation: { type: Schema.Types.ObjectId, ref: 'Reservation', default: null },
    lastStateChangeAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

withJsonTransform(parkingSpaceSchema);

export const ParkingSpace = model<IParkingSpace>('ParkingSpace', parkingSpaceSchema);
