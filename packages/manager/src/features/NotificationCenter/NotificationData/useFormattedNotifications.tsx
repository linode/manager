import { Notification, NotificationSeverity } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { path } from 'ramda';
import * as React from 'react';
import useNotifications from 'src/hooks/useNotifications';
import { notificationContext } from '../NotificationContext';
import { NotificationItem } from '../NotificationSection';
import { checkIfMaintenanceNotification } from './notificationUtils';
import RenderNotification from './RenderNotification';

export const useFormattedNotifications = (): NotificationItem[] => {
  const context = React.useContext(notificationContext);

  const notifications = useNotifications();

  const dayOfMonth = DateTime.local().day;

  const handleClose = () => {
    context.closeDrawer();
  };

  return notifications
    .filter((thisNotification) => {
      /**
       * Don't show balance overdue notifications at the beginning of the month
       * to avoid causing anxiety if an automatic payment takes time to process.
       * This is a temporary hack; customers can have their payment grace period extended
       * to more than 3 days, and using this method also means that if you're more than
       * a month overdue the notification will disappear for three days.
       */
      return !(thisNotification.type === 'payment_due' && dayOfMonth <= 3);
    })
    .map((notification, idx) =>
      formatNotificationForDisplay(
        interceptNotification(notification),
        idx,
        handleClose
      )
    );
};

const interceptNotification = (notification: Notification): Notification => {
  if (notification.type === 'ticket_abuse') {
    return {
      ...notification,
      message: notification.message.replace('!', '.'),
    };
  }

  /** there is maintenance on this Linode */
  if (
    checkIfMaintenanceNotification(notification.type) &&
    notification.entity?.type === 'linode'
  ) {
    /** replace "this Linode" with the name of the Linode */
    const linodeAttachedToNotification: string | undefined = path(
      ['label'],
      notification.entity
    );
    return {
      ...notification,
      label: `Maintenance Scheduled`,
      severity: adjustSeverity(notification),
      message: notification.body
        ? linodeAttachedToNotification
          ? notification.body.replace(
              'This Linode',
              linodeAttachedToNotification
            )
          : notification.body
        : notification.message,
    };
  }

  return notification;
};

const formatNotificationForDisplay = (
  notification: Notification,
  idx: number,
  onClose: () => void,
  shouldIncludeInCount: boolean = true
): NotificationItem => ({
  id: `notification-${idx}`,
  body: <RenderNotification notification={notification} onClose={onClose} />,
  countInTotal: shouldIncludeInCount,
});

// For communicative purposes in the UI, in some cases we want to adjust the severity of certain notifications compared to what the API returns. If it is a maintenance notification of any sort, we display them as major instead of critical. Otherwise, we return the existing severity.
export const adjustSeverity = ({
  severity,
  type,
}: Notification): NotificationSeverity => {
  if (checkIfMaintenanceNotification(type)) {
    return 'major';
  }

  return severity;
};

export default useFormattedNotifications;
