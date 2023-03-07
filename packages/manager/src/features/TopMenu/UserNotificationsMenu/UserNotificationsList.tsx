import { Notification } from '@linode/api-v4/lib/account';
import { Region } from '@linode/api-v4/lib/regions';
import { path } from 'ramda';
import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { reportException } from 'src/exceptionReporting';
import { useRegionsQuery } from 'src/queries/regions';
import UserNotificationListItem from './UserNotificationListItem';

const useStyles = makeStyles((theme: Theme) => ({
  emptyText: {
    padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
    fontFamily: theme.font.bold,
  },
}));

interface Props {
  notifications: Notification[];
  closeMenu: () => void;
}

const UserNotificationsList = (props: Props) => {
  const { push } = useHistory();
  const classes = useStyles();
  const { notifications, closeMenu } = props;

  const { data: regions } = useRegionsQuery();

  if (notifications.length === 0) {
    return (
      <Typography className={classes.emptyText}>
        You have no notifications.
      </Typography>
    );
  }

  return (
    <>
      {notifications.map((notification, idx) => {
        const interceptedNotification = interceptNotification(
          notification,
          regions ?? []
        );
        const onClick = createClickHandlerForNotification(
          interceptedNotification,
          (targetPath: string) => {
            closeMenu();
            push(targetPath);
          }
        );
        return (
          <UserNotificationListItem
            key={idx}
            label={interceptedNotification.label}
            message={interceptedNotification.message}
            severity={interceptedNotification.severity}
            onClick={onClick}
          />
        );
      })}
    </>
  );
};

const interceptNotification = (
  notification: Notification,
  regions: Region[]
): Notification => {
  /** this is an outage to one of the datacenters */
  if (
    notification.type === 'outage' &&
    notification.entity &&
    notification.entity.type === 'region'
  ) {
    const region = regions.find(
      // @ts-expect-error are the API docs wrong?
      (r) => r.id === notification.entity.id
    );

    if (!region) {
      reportException(
        'Could not find the DC name for the outage notification',
        {
          region: notification.entity.id,
        }
      );
    }

    /** replace "this facility" with the name of the datacenter */
    return {
      ...notification,
      label: notification.label
        .toLowerCase()
        .replace('this facility', region?.label ?? 'one of our facilities'),
      message: notification.message
        .toLowerCase()
        .replace('this facility', region?.label ?? 'one of our facilities'),
    };
  }

  /** there is maintenance on this Linode */
  if (
    notification.type === 'maintenance' &&
    notification.entity &&
    notification.entity.type === 'linode'
  ) {
    /** replace "this Linode" with the name of the Linode */
    const linodeAttachedToNotification = path(['label'], notification.entity);
    return {
      ...notification,
      label: `Maintenance Scheduled`,
      severity: 'major',
      message: `${
        linodeAttachedToNotification
          ? `Linode ${linodeAttachedToNotification}`
          : `This Linode`
      }
          has scheduled maintenance`,
    };
  }

  return notification;
};

const createClickHandlerForNotification = (
  notification: Notification,
  onClick: (path: string) => void
) => {
  const type = path<string>(['entity', 'type'], notification);
  const id = path<number>(['entity', 'id'], notification);

  if (!type || !id) {
    return;
  }

  switch (type) {
    case 'linode':
      return (e: React.MouseEvent<HTMLElement>) => onClick(`/linodes/${id}`);

    case 'ticket':
      return (e: React.MouseEvent<HTMLElement>) =>
        onClick(`/support/tickets/${id}`);

    default:
      return;
  }
};

export default UserNotificationsList;
