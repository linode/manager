import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import UserNotificationListItem from './UserNotificationListItem';

type ClassNames = 'emptyText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  emptyText: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    fontFamily: theme.font.bold
  }
});

interface Props {
  notifications: Linode.Notification[];
  closeMenu: () => void;
}

type CombinedProps = Props & RouteComponentProps<void> & WithStyles<ClassNames>;

class UserNotificationsList extends React.Component<CombinedProps, {}> {
  render() {
    const {
      classes,
      notifications,
      closeMenu,
      history: { push }
    } = this.props;

    if (notifications.length === 0) {
      return (
        <Typography className={classes.emptyText}>
          You have no notifications.
        </Typography>
      );
    }

    return (notifications || []).map((notification, idx) => {
      const interceptedNotification = interceptNotification(notification);
      const onClick = createClickHandlerForNotification(
        interceptedNotification,
        (targetPath: string) => {
          closeMenu();
          push(targetPath);
        }
      );
      return React.createElement(UserNotificationListItem, {
        key: idx,
        label: interceptedNotification.label,
        message: interceptedNotification.message,
        severity: interceptedNotification.severity,
        onClick
      });
    });
  }
}

const interceptNotification = (
  notification: Linode.Notification
): Linode.Notification => {
  /** this is an outage to one of the datacenters */
  if (
    notification.type === 'outage' &&
    notification.entity &&
    notification.entity.type === 'region'
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
      label: notification.label
        .toLowerCase()
        .replace('this facility', convertedRegion || 'one of our facilities'),
      message: notification.message
        .toLowerCase()
        .replace('this facility', convertedRegion || 'one of our facilities')
    };
  }

  /** there is maintenance on this Linode */
  if (
    notification.type === 'maintenance' &&
    notification.entity &&
    notification.entity.type === 'linode'
  ) {
    /** replace "this Linode" with the name of the Linode */
    return {
      ...notification,
      label: `Maintenance Scheduled`,
      severity: 'major',
      message: `Linode ${pathOr(
        'this Linode',
        ['label'],
        notification.entity
      )}has scheduled maintenance.`
    };
  }

  return notification;
};

const createClickHandlerForNotification = (
  notification: Linode.Notification,
  onClick: (path: string) => void
) => {
  /**
   * Privacy policy changes can only be made in CF manager for now, so we have to
   * link externally.
   */
  if (
    notification.type === 'notice' &&
    notification.label === `We've updated our policies.`
  ) {
    return (e: React.MouseEvent<HTMLElement>) => {
      window.location.href = `https://manager.linode.com/account/policy`;
    };
  }

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

const styled = withStyles(styles);

const enhanced = compose<any, any, any>(
  styled,
  withRouter
);

export default enhanced(UserNotificationsList);
