import { compose, path } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
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
      const onClick = createClickHandlerForNotification(
        notification,
        (targetPath: string) => {
          closeMenu();
          push(targetPath);
        }
      );
      return React.createElement(UserNotificationListItem, {
        key: idx,
        label: notification.label,
        message: notification.message,
        severity: notification.severity,
        onClick
      });
    });
  }
}

const createClickHandlerForNotification = (
  notification: null | Linode.Notification,
  onClick: (path: string) => void
) => {
  if (!notification) {
    return;
  }

  /**
   * Privacy poliicy changes can only be made in CF manager for now, so we have to
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
