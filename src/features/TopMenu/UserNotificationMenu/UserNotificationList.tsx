import * as React from 'react';
import * as moment from 'moment';

import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import eventTypes from 'src/eventTypes';
import UserNotificationListItem, {
  UserNotificationListItemProps,
} from './UserNotificationListItem';

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
      (events as Linode.Event[]).map((event, key) =>
        <UserNotificationListItem
          key={key}
          {...createEventProps(event)}
        />,
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

const createEventProps = (event: Linode.Event): UserNotificationListItemProps => {
  const success = !event.seen;
  const content = `${moment(`${event.created}Z`).fromNow()} by ${event.username}`;
  const remaining = event.percent_complete;
  const entity = (event.entity as Linode.Entity);
  const options = eventTypes[event.action] || {
    pastTenseAction: event.action,
    presentTenseAction: event.action,
  };
  const verb = remaining && remaining < 100
    ? options.presentTenseAction
    : options.pastTenseAction;

  const title = `${verb} ${entity.label}`;

  const linodeEventActionMap = {
    // linode_boot: {},
    // linode_create: {},
    // linode_delete: {},
    // linode_shutdown: {},
    // linode_reboot: {},
    // linode_snapshot: {},
    // linode_addip: {},
    // linode_migrate: {},
    // linode_rebuild: {},
    // linode_clone: {},
    // disk_create: {},
    // disk_delete: {},
    // disk_duplicate: {},
    // disk_resize: {},
    // backups_enable: {},
    // backups_cancel: {},
    // backups_restore: {},
    // password_reset: {},
    // domain_create: {},
    // domain_delete: {},
    // domain_record_create: {},
    // domain_record_delete: {},
    // stackscript_create: {},
    // stackscript_publicize: {},
    // stackscript_revise: {},
    // stackscript_delete: {},
    community_question_reply: {
      title: entity.label,
      success,
      content: `${event.username} has replied to your question.`,
    },
    default: {
      title,
      success,
      content,
    },
  };

  return linodeEventActionMap.hasOwnProperty(event.action)
    ? linodeEventActionMap[event.action]
    : linodeEventActionMap.default;
};

export default styled<Props>(UserNotificationsList);
