import { Notification } from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';

export const list = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user!.sub })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ notifications });
});

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ user: req.user!.sub, read: false });
  res.json({ count });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user!.sub }, { read: true });
  res.json({ ok: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user!.sub, read: false }, { read: true });
  res.json({ ok: true });
});
