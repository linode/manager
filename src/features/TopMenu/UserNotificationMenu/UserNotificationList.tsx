import * as moment from 'moment';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import eventMessageGenerator from 'src/eventMessageGenerator';
import { reportException } from 'src/exceptionReporting';

import UserNotificationListItem, { UserNotificationListItemProps } from './UserNotificationListItem';

const reportUnfoundEvent = (event: Linode.Event) =>
  reportException('Unknown API event received', event)

const reportEventError = (event: Linode.Event, err: Error) =>
  reportException(err, event);

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  events?: Linode.Event[];
  notifications?: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const UserNotificationsList: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    notifications,
    events,
  } = props;

  return (
    <React.Fragment>
      {
        (notifications as Linode.Notification[]).map((notification, key) =>
          <UserNotificationListItem
            key={key}
            {...createNotificationProps(notification)}
          />,
        )
      }
      {
        (events as Linode.Event[])
          .reduce((result, event): UserNotificationListItemProps[] => {
            const title = eventMessageGenerator(event, reportUnfoundEvent, reportEventError);
            const content = `${moment(`${event.created}Z`).fromNow()} by ${event.username}`;
            const success = event.status !== 'failed' && !event.seen;
            const error = event.status === 'failed';

            return title ? [...result, { title, content, success, error }] : result;
          }, [])
          .map((props: UserNotificationListItemProps, key: number) =>
            <UserNotificationListItem key={key} {...props} />,
        )
      }
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

UserNotificationsList.defaultProps = {
  events: [],
  notifications: [],
};

const createNotificationProps = (
  notification: Linode.Notification,
): UserNotificationListItemProps => {
  const linodeNotificationsTypeMap = {
    // migration_scheduled: {},
    // migration_pending: {},
    // reboot_scheduled: {},
    // outage: {},
    // payment_due: {},
    // ticket_important: {},
    // ticket_abuse: {},
    // notice: {},
    default: {
      success: notification.severity === 'minor',
      warning: notification.severity === 'major',
      error: notification.severity === 'critical',
      title: notification.label,
    },
  };
  return linodeNotificationsTypeMap.hasOwnProperty(notification.type)
    ? linodeNotificationsTypeMap[notification.type]
    : linodeNotificationsTypeMap.default;
};

export default styled<Props>(UserNotificationsList);
