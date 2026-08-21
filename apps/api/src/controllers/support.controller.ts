import { SupportTicket } from '../models/SupportTicket';
import { User } from '../models/User';
import { nextSeq } from '../models/Counter';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/apiError';

export const create = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.sub);
  if (!user) throw ApiError.unauthorized();

  const seq = await nextSeq('ticket');
  const code = `SUP-${String(seq).padStart(4, '0')}`;

  const ticket = await SupportTicket.create({
    code,
    user: user._id,
    userName: user.name,
    userEmail: user.email,
    ...req.body,
  });
  res.status(201).json({ ticket });
});

export const listMine = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ user: req.user!.sub }).sort({ createdAt: -1 });
  res.json({ tickets });
});
