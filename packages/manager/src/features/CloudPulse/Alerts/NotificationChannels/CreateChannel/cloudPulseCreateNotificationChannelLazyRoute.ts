import { createLazyRoute } from '@tanstack/react-router';

import { CreateNotificationChannel } from './CreateNotificationChannel';

export const cloudPulseCreateNotificationChannelLazyRoute = createLazyRoute(
  '/alerts/notification-channels/create'
)({
  component: CreateNotificationChannel,
});
