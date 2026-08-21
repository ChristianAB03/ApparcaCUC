import { ParkingSpace } from '../models/ParkingSpace';
import { getStateCounts } from '../services/parking.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';
import { serializeSpace } from '../utils/serializers';

export const getOverview = asyncHandler(async (_req, res) => {
  const counts = await getStateCounts();
  res.json({ counts, sensorSimulated: true });
});

export const listSpaces = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  const { zone, state, type } = req.query as Record<string, string | undefined>;
  if (zone) filter.zone = zone;
  if (state) filter.state = state;
  if (type) filter.type = type;

  const spaces = await ParkingSpace.find(filter).sort({ zone: 1, position: 1 });
  res.json({ spaces: spaces.map(serializeSpace) });
});

export const getSpace = asyncHandler(async (req, res) => {
  const space = await ParkingSpace.findById(req.params.id);
  if (!space) throw ApiError.notFound('Espacio no encontrado.');
  res.json({ space: serializeSpace(space) });
});
