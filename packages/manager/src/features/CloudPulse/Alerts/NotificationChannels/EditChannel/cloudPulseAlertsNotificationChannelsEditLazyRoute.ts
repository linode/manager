import { createLazyRoute } from '@tanstack/react-router';

import { EditNotificationChannel } from './EditNotificationChannel';

export const cloudPulseAlertsNotificationChannelEditLazyRoute = createLazyRoute(
  '/alerts/notification-channels/edit/$channelId'
)({
  component: EditNotificationChannel,
});
