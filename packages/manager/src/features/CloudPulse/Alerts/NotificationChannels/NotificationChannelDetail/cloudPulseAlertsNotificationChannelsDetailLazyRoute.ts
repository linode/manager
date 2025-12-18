import { createLazyRoute } from '@tanstack/react-router';

import { NotificationChannelDetail } from './NotificationChannelDetail';

export const cloudPulseAlertsNotificationChannelDetailLazyRoute =
  createLazyRoute('/alerts/notification-channels/detail/$channelId')({
    component: NotificationChannelDetail,
  });
