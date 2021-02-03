import * as React from 'react';
import useNotifications from 'src/hooks/useNotifications';
import { NotificationItem } from '../NotificationSection';
import { Notification } from '@linode/api-v4/lib/account';
import RenderNotification from './RenderNotification';

export const useFormattedNotifications = () => {
  const notifications = useNotifications();

  return notifications.map((notification, idx) =>
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

/*

  id: string;
  body: string | JSX.Element;
  timeStamp?: string;
  countInTotal: boolean;

*/
