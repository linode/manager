import * as React from 'react';
import RenderNotification from './RenderNotification';
import Typography from 'src/components/core/Typography';
import useDismissibleNotifications from 'src/hooks/useDismissibleNotifications';
import { checkIfMaintenanceNotification } from './notificationUtils';
import { complianceUpdateContext } from 'src/context/complianceUpdateContext';
import { DateTime } from 'luxon';
import { formatDate } from 'src/utilities/formatDate';
import { Link } from 'src/components/Link';
import { LinkStyledButton } from 'src/components/Button/LinkStyledButton';
import { notificationContext as _notificationContext } from '../NotificationContext';
import { NotificationItem } from '../NotificationSection';
import { path } from 'ramda';
import { Profile } from '@linode/api-v4';
import { Region } from '@linode/api-v4/lib/regions';
import { reportException } from 'src/exceptionReporting';
import { styled } from '@mui/material/styles';
import { useNotificationsQuery } from 'src/queries/accountNotifications';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import {
  Notification,
  NotificationSeverity,
  NotificationType,
} from '@linode/api-v4/lib/account';

export interface ExtendedNotification extends Notification {
  jsx?: JSX.Element;
}

export const useFormattedNotifications = (): NotificationItem[] => {
  const notificationContext = React.useContext(_notificationContext);
  const {
    dismissNotifications,
    hasDismissedNotifications,
  } = useDismissibleNotifications();

  const { data: regions } = useRegionsQuery();
  const { data: profile } = useProfile();

  const { data: notifications } = useNotificationsQuery();

  const volumeMigrationScheduledIsPresent = notifications?.some(
    (notification) =>
      notification.type === ('volume_migration_scheduled' as NotificationType)
  );

  const dayOfMonth = DateTime.local().day;

  const handleClose = () => {
    dismissNotifications(notifications ?? [], { prefix: 'notificationMenu' });
    notificationContext.closeMenu();
  };

  const filteredNotifications = notifications?.filter((thisNotification) => {
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

  if (volumeMigrationScheduledIsPresent && filteredNotifications) {
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

  return (
    filteredNotifications?.map((notification, idx) =>
      formatNotificationForDisplay(
        interceptNotification(
          notification,
          handleClose,
          regions ?? [],
          profile
        ),
        idx,
        handleClose,
        !hasDismissedNotifications([notification], 'notificationMenu')
      )
    ) ?? []
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
  regions: Region[],
  profile: Profile | undefined
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
        {formatDate(notification.when as string, {
          timezone: profile?.timezone,
        })}
        .
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
      // @ts-expect-error Are the API docs wrong?
      const region = regions.find((r) => r.id === notification.entity?.id);

      if (!region) {
        reportException(
          'Could not find the DC name for the outage notification',
          {
            region: notification.entity.id,
          }
        );
      }

      const jsx = (
        <Typography>
          We are aware of an issue affecting service in{' '}
          {region?.label || 'one of our facilities'}. If you are experiencing
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
        <StyledLink
          to="/account/billing"
          onClick={onClose}
          severity={notification.severity}
        >
          {notification.message}
        </StyledLink>{' '}
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

const StyledLink = styled(Link)<Pick<Notification, 'severity'>>(
  ({ theme, ...props }) => ({
    ...(props.severity === 'critical' && {
      color: `${theme.color.red} !important`,
      '&:hover': {
        textDecoration: `${theme.color.red} underline`,
      },
    }),
  })
);

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

const ComplianceNotification: React.FC<{}> = () => {
  const complianceModelContext = React.useContext(complianceUpdateContext);

  return (
    <Typography>
      Please review the compliance update for guidance regarding the EU Standard
      Contractual Clauses and its application to users located in Europe as well
      as deployments in Linode’s London and Frankfurt data centers
      <LinkStyledButton
        onClick={() => complianceModelContext.open()}
        sx={{ minHeight: 0 }}
      >
        Review compliance update.
      </LinkStyledButton>
    </Typography>
  );
};

export const isEUModelContractNotification = (notification: Notification) => {
  return (
    notification.type === 'notice' && /eu-model/gi.test(notification.message)
  );
};
