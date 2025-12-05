import { createLazyRoute } from '@tanstack/react-router';

import { NotificationChannelListing } from './NotificationChannelListing';

export const cloudPulseAlertsNotificationChannelsListingLazyRoute =
  createLazyRoute('/alerts/notification-channels')({
    component: NotificationChannelListing,
  });
