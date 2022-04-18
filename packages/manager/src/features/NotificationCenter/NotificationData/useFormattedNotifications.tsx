import {
  Notification,
  NotificationSeverity,
  NotificationType,
} from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { path } from 'ramda';
import * as React from 'react';
import Button from 'src/components/Button';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { dcDisplayNames } from 'src/constants';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import { reportException } from 'src/exceptionReporting';
import { useStyles } from 'src/features/NotificationCenter/NotificationData/RenderNotification';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import useNotifications from 'src/hooks/useNotifications';
import { formatDate } from 'src/utilities/formatDate';
import { notificationContext as _notificationContext } from '../NotificationContext';
import { NotificationItem } from '../NotificationSection';
import { checkIfMaintenanceNotification } from './notificationUtils';
import RenderNotification from './RenderNotification';

export interface ExtendedNotification extends Notification {
  jsx?: JSX.Element;
}

export const useFormattedNotifications = (
  givenNotifications?: Notification[]
): NotificationItem[] => {
  const notificationContext = React.useContext(_notificationContext);
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const notifications = givenNotifications ?? useNotifications();

  const volumeMigrationScheduledIsPresent = notifications.some(
    (notification) =>
      notification.type === ('volume_migration_scheduled' as NotificationType)
  );

  const classes = useStyles();

  const dayOfMonth = DateTime.local().day;

  const handleClose = () => {
    dismissNotifications(notifications, { prefix: 'notificationMenu' });
    notificationContext.closeMenu();
  };

  const filteredNotifications = notifications.filter((thisNotification) => {
    /**
     * Don't show balance overdue notifications at the beginning of the month
     * to avoid causing anxiety if an automatic payment takes time to process.
     * This is a temporary hack; customers can have their payment grace period extended
     * to more than 3 days, and using this method also means that if you're more than
     * a month overdue the notification will disappear for three days.
     *
     * Also filter out volume_migration_scheduled notifications, since those will be condensed into a single customized one.
     */
    return (
      !(thisNotification.type === 'payment_due' && dayOfMonth <= 3) &&
      !['volume_migration_scheduled', 'volume_migration_imminent'].includes(
        thisNotification.type
      )
    );
  });

  if (volumeMigrationScheduledIsPresent) {
    filteredNotifications.push({
      type: 'volume_migration_scheduled' as NotificationType,
      entity: null,
      when: null,
      message:
        'You have pending volume migrations. Check the maintenance page for more details.',
      label: 'You have a scheduled Block Storage volume upgrade pending!',
      severity: 'major',
      until: null,
      body: null,
    });
  }

  return filteredNotifications.map((notification, idx) =>
    formatNotificationForDisplay(
      interceptNotification(notification, handleClose, classes),
      idx,
      handleClose,
      !hasDismissedNotifications([notification], 'notificationMenu')
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
  onClose: () => void,
  classes: any
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

  // Migration interceptions
  if (notification.type === 'migration_scheduled') {
    const jsx = (
      <Typography>
        You have a scheduled migration for{' '}
        <Link to={`/linodes/${notification.entity?.id}`} onClick={onClose}>
          {notification.entity?.label}
        </Link>
        , which will automatically execute on{' '}
        {formatDate(notification.when as string)}.
      </Typography>
    );

    return {
      ...notification,
      jsx,
    };
  }

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

  if (notification.type === 'payment_due') {
    const criticalSeverity = notification.severity === 'critical';

    if (!criticalSeverity) {
      // A critical severity indicates the user's balance is past due; temper the messaging a bit outside of that case by replacing the exclamation point.
      notification.message = notification.message.replace('!', '.');
    }

    const jsx = (
      <Typography>
        <Link
          to="/account/billing"
          onClick={onClose}
          className={criticalSeverity ? classes.redLink : classes.greyLink}
        >
          {notification.message}
        </Link>{' '}
        <Link to="/account/billing/make-payment" onClick={onClose}>
          Make a payment now.
        </Link>
      </Typography>
    );

    return {
      ...notification,
      jsx,
    };
  }

  if (isEUModelContractNotification(notification)) {
    // This needs to be its own component so it can use hooks.
    const jsx = <ComplianceNotification />;

    return {
      ...notification,
      jsx,
    };
  }

  if (notification.type === 'volume_migration_scheduled') {
    const jsx = (
      <Typography>
        Attached Volumes are eligible for a free upgrade to NVMe-based Block
        Storage. Visit the{' '}
        <Link to={'/account/maintenance/'} onClick={onClose}>
          Maintenance page
        </Link>{' '}
        to view scheduled upgrades or visit the{' '}
        <Link to={'/volumes'} onClick={onClose}>
          Volumes page
        </Link>{' '}
        to begin self-service upgrades if available.
      </Typography>
    );

    return {
      ...notification,
      jsx,
    };
  }

  /* If the notification is not of any of the types above, return the notification object without modification. In this case, logic in <RenderNotification />
  will either linkify notification.message or render it plainly.
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

const useComplianceNotificationStyles = makeStyles((theme: Theme) => ({
  reviewUpdateButton: {
    ...theme.applyLinkStyles,
    minHeight: 0,
  },
}));

const ComplianceNotification: React.FC<{}> = () => {
  const classes = useComplianceNotificationStyles();
  const complianceModelContext = React.useContext(complianceUpdateContext);

  return (
    <Typography>
      Please review the compliance update for guidance regarding the EU Standard
      Contractual Clauses and its application to users located in Europe as well
      as deployments in Linode’s London and Frankfurt data centers
      <Button
        className={classes.reviewUpdateButton}
        onClick={() => complianceModelContext.open()}
      >
        Review compliance update.
      </Button>
    </Typography>
  );
};

export const isEUModelContractNotification = (notification: Notification) => {
  return (
    notification.type === 'notice' && /eu-model/gi.test(notification.message)
  );
};
