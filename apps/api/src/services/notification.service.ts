import { Types } from 'mongoose';
import { Notification } from '../models/Notification';
import { NotificationType } from '../constants';

export async function notify(params: {
  user: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  meta?: Record<string, unknown>;
}) {
  return Notification.create({
    user: params.user,
    type: params.type,
    title: params.title,
    message: params.message,
    meta: params.meta,
  });
}
