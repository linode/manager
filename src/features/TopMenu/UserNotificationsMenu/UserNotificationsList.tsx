import { pathOr } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Notice from 'src/components/Notice';
import { Typography } from '../../../../node_modules/@material-ui/core';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    justifyContent: 'center',
    padding: theme.spacing.unit,
    '&:first-child': {
      marginTop: theme.spacing.unit,
    },
    '& p': {
      color: '#333',
    },
  },
  list: {

  },
});

interface Props {
  notifications: Linode.Notification[];
}

interface State { }

type CombinedProps = Props & WithStyles<ClassNames>;

class UserNotificationsList extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes, notifications } = this.props;


    if (notifications.length === 0) {
      return <Typography>You have no notifications.</Typography>
    }

    return (notifications || []).map((notification, idx) => {
      const level = pathOr('warning', [notification.severity], severityMap);
      const onClick = createClickHandlerForNotification(notification);

      return React.createElement(Notice, {
        key: idx,
        children: notification.message,
        className: `${classes.root} ${'notification'}`,
        [level]: true,
        notificationList: true,
        onClick
      });
    });
  }
}

const createClickHandlerForNotification =
  (n: Linode.Notification) => (e: React.MouseEvent<HTMLElement>): void => {

  };

const severityMap = {
  minor: 'success',
  major: 'warning',
  critical: 'error',
};

const styled = withStyles(styles, { withTheme: true });

export default styled(UserNotificationsList);
