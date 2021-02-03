import { Notification } from '@linode/api-v4/lib/account';
import * as React from 'react';
import useNotifications from 'src/hooks/useNotifications';
import { NotificationItem } from '../NotificationSection';
import RenderNotification from './RenderNotification';

export const useFormattedNotifications = () => {
  const { combinedNotifications } = useNotifications();

  return combinedNotifications.map((notification, idx) =>
    formatNotificationForDisplay(notification, idx)
  );
};

const formatNotificationForDisplay = (
  notification: Notification,
  idx: number
): NotificationItem => ({
  id: `notification-${idx}`,
  body: <RenderNotification notification={notification} />,
  countInTotal: false
});

export default useFormattedNotifications;
