import { Vehicle } from '../models/Vehicle';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

const MAX_VEHICLES = 5;

export const list = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({ owner: req.user!.sub }).sort({ isDefault: -1, createdAt: 1 });
  res.json({ vehicles });
});

export const create = asyncHandler(async (req, res) => {
  const count = await Vehicle.countDocuments({ owner: req.user!.sub });
  if (count >= MAX_VEHICLES) {
    throw ApiError.badRequest(`Puedes registrar hasta ${MAX_VEHICLES} vehículos en la demo.`);
  }

  const data = req.body as Record<string, unknown> & { isDefault?: boolean };
  const isDefault = Boolean(data.isDefault) || count === 0;
  if (isDefault) await Vehicle.updateMany({ owner: req.user!.sub }, { isDefault: false });

  const vehicle = await Vehicle.create({ ...data, isDefault, owner: req.user!.sub });
  res.status(201).json({ vehicle });
});

export const update = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOne({ _id: req.params.id, owner: req.user!.sub });
  if (!vehicle) throw ApiError.notFound('Vehículo no encontrado.');

  const data = req.body as Record<string, unknown> & { isDefault?: boolean };
  if (data.isDefault === true) {
    await Vehicle.updateMany({ owner: req.user!.sub, _id: { $ne: vehicle._id } }, { isDefault: false });
  }
  Object.assign(vehicle, data);
  await vehicle.save();
  res.json({ vehicle });
});

export const remove = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, owner: req.user!.sub });
  if (!vehicle) throw ApiError.notFound('Vehículo no encontrado.');
  res.json({ ok: true });
});
