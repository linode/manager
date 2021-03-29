import { Notification, NotificationSeverity } from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { path } from 'ramda';
import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useNotifications from 'src/hooks/useNotifications';
import { notificationContext } from '../NotificationContext';
import { NotificationItem } from '../NotificationSection';
import { checkIfMaintenanceNotification } from './notificationUtils';
import RenderNotification from './RenderNotification';

export interface ExtendedNotification extends Notification {
  jsx?: JSX.Element;
}

export const useFormattedNotifications = (): NotificationItem[] => {
  const context = React.useContext(notificationContext);
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const notifications = useNotifications();

  const dayOfMonth = DateTime.local().day;

  const handleClose = () => {
    dismissNotifications(notifications, { prefix: 'notificationDrawer' });
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
        interceptNotification(notification, handleClose),
        idx,
        handleClose,
        !hasDismissedNotifications([notification], 'notificationDrawer')
      )
    );
};

/**
 * This function intercepts the notification for further processing and formatting. Depending on the notification type,
 * the contents of notification.message get changed, or JSX is generated and added to the notification object, etc.
 *
 * Specific types of notifications that are altered here: ticket_abuse, ticket_important, maintenance, maintenance_scheduled,
 * migration_pending, outage
 * @param notification
 * @param onClose
 */
const interceptNotification = (
  notification: Notification,
  onClose: () => void
): ExtendedNotification => {
  // Ticket interceptions
  if (notification.type === 'ticket_abuse') {
    return {
      ...notification,
      message: `${notification.message.replace('!', '')} (${
        notification?.entity?.label
      }): #${notification?.entity?.id}`,
    };
  }

  if (notification.type === 'ticket_important') {
    if (!notification.entity?.id) {
      return notification;
    }

    const jsx = (
      <Typography>
        You have an{' '}
        <Link
          to={`/support/tickets/${notification.entity?.id}`}
          onClick={onClose}
        >
          important ticket
        </Link>{' '}
        open!
      </Typography>
    );

    return {
      ...notification,
      jsx,
    };
  }

  /** Linode Maintenance interception */
  if (
    checkIfMaintenanceNotification(notification.type) &&
    notification.entity?.type === 'linode'
  ) {
    /** replace "this Linode" with the name of the Linode */
    const linodeAttachedToNotification: string | undefined = path(
      ['label'],
      notification.entity
    );

    const jsx = (
      <Typography>
        <Link
          to={`/linodes/${notification?.entity?.id ?? ''}`}
          onClick={onClose}
        >
          {notification?.entity?.label ?? 'One of your Linodes'}
        </Link>{' '}
        resides on a host that is pending critical maintenance. You should have
        received a{' '}
        <Link to={'/support/tickets?type=open'} onClick={onClose}>
          support ticket
        </Link>{' '}
        that details how you will be affected. Please see the aforementioned
        ticket and{' '}
        <Link to={'https://status.linode.com/'}>status.linode.com</Link> for
        more details.
      </Typography>
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
      jsx,
    };
  }

  // Migration interception
  if (notification.type === 'migration_pending') {
    const jsx = (
      <Typography>
        You have a migration pending!{' '}
        <Link to={`/linodes/${notification.entity?.id}`} onClick={onClose}>
          {notification.entity?.label}
        </Link>{' '}
        must be offline before starting the migration.
      </Typography>
    );

    return {
      ...notification,
      jsx,
    };
  }

  // Outage interception
  if (notification.type === 'outage') {
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
            convertedRegion,
          }
        );
      }

      const jsx = (
        <Typography>
          We are aware of an issue affecting service in{' '}
          {convertedRegion || 'one of our facilities'}. If you are experiencing
          service issues in this facility, there is no need to open a support
          ticket at this time. Please monitor our status blog at{' '}
          <Link to={'https://status.linode.com/'}>
            https://status.linode.com
          </Link>{' '}
          for further information. Thank you for your patience and
          understanding.
        </Typography>
      );

      return {
        ...notification,
        jsx,
      };
    }

    return notification;
  }

  /* If the notification is not of any of the types above, return the notification object without modification. In this case, logic in <RenderNotification />
  will either linkify notifcation.message or render it plainly.
  */
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
