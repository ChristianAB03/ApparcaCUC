import { Schema, model, Types } from 'mongoose';
import { VEHICLE_TYPES, VehicleType } from '../constants';
import { withJsonTransform } from '../utils/mongoose';

// Not extending Document: the schema has a `model` field which would clash
// with Mongoose's `Document.model()` method.
export interface IVehicle {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  plate: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plate: { type: String, required: true, uppercase: true, trim: true, maxlength: 12 },
    type: { type: String, enum: VEHICLE_TYPES, default: 'car' },
    brand: { type: String, trim: true, maxlength: 40, default: '' },
    model: { type: String, trim: true, maxlength: 40, default: '' },
    color: { type: String, trim: true, maxlength: 30, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// A user cannot register the same plate twice.
vehicleSchema.index({ owner: 1, plate: 1 }, { unique: true });

withJsonTransform(vehicleSchema);

export const Vehicle = model<IVehicle>('Vehicle', vehicleSchema);
