import { createLazyRoute } from '@tanstack/react-router';

import { EditChannelLanding } from './EditChannelLanding';

export const cloudPulseAlertsNotificationChannelEditLazyRoute = createLazyRoute(
  '/alerts/notification-channels/edit/$channelId'
)({
  component: EditChannelLanding,
});
