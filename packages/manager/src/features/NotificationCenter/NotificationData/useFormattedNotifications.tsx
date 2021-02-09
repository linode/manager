import { Notification } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { path } from 'ramda';
import * as React from 'react';
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import useAccount from 'src/hooks/useAccount';
import useNotifications from 'src/hooks/useNotifications';
import { NotificationItem } from '../NotificationSection';
import { checkIfMaintenanceNotification } from './notificationUtils';
import RenderNotification from './RenderNotification';

export const useFormattedNotifications = () => {
  const notifications = useNotifications();
  const { account } = useAccount();

  const balance = account?.data?.balance ?? 0;
  const dayOfMonth = DateTime.local().day;
  const combinedNotifications = [...notifications];
  if (balance > 0 && dayOfMonth >= 3) {
    combinedNotifications.unshift({
      entity: null,
      label: '',
      message: `You have a past due balance of $${balance}. Please make a payment immediately to avoid service disruption.`,
      type: 'payment_due',
      severity: 'critical',
      when: null,
      until: null,
      body: null
    });
  }

  return combinedNotifications.map((notification, idx) =>
    formatNotificationForDisplay(interceptNotification(notification), idx)
  );
};

const interceptNotification = (notification: Notification): Notification => {
  /** this is an outage to one of the datacenters */
  if (
    notification.type === 'outage' &&
    notification.entity?.type === 'region'
  ) {
    const convertedRegion = dcDisplayNames[notification.entity.id];

    if (!convertedRegion) {
      reportException(
        'Could not find the DC name for the outage notification',
        {
          rawRegion: notification.entity.id,
          convertedRegion
        }
      );
    }

    /** replace "this facility" with the name of the datacenter */
    return {
      ...notification,
      severity: reduceSeverity(notification),
      label: notification.label
        .toLowerCase()
        .replace('this facility', convertedRegion || 'one of our facilities'),
      message: notification.message
        .toLowerCase()
        .replace('this facility', convertedRegion || 'one of our facilities')
    };
  }

  if (notification.type === 'ticket_abuse') {
    return {
      ...notification,
      message: notification.message.replace('!', '.'),
      severity: reduceSeverity(notification)
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
      severity: reduceSeverity(notification),
      message: notification.body
        ? linodeAttachedToNotification
          ? notification.body.replace(
              'This Linode',
              linodeAttachedToNotification
            )
          : notification.body
        : notification.message
    };
  }

  return notification;
};

const formatNotificationForDisplay = (
  notification: Notification,
  idx: number
): NotificationItem => ({
  id: `notification-${idx}`,
  body: <RenderNotification notification={notification} />,
  countInTotal: true
});

// For communicative purposes in the UI, in some cases we want to upgrade or downgrade the severity of certain notifications compared to what the API returns. Example: the API has ticket_abuse as having a severity of major, but we want to show those notifications as critical.
const reduceSeverity = ({ severity, type }: Notification) => {
  if (
    checkIfMaintenanceNotification(type) ||
    (severity === 'major' && type !== 'ticket_abuse')
  ) {
    return 'major';
  }
  if (severity === 'critical' || type === 'ticket_abuse') {
    return 'critical';
  }

  return 'minor';
};

export default useFormattedNotifications;
