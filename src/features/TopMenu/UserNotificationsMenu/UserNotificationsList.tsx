import * as classNames from 'classnames';
import { compose, path, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Notice from 'src/components/Notice';

type ClassNames = 'root' 
| 'pointer'
| 'emptyText';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    margin: 0,
    justifyContent: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& p': {
      color: '#333',
    },
    '& + .notice': {
      marginTop: '0 !important',
    },
  },
  pointer: {
    cursor: 'pointer',
  },
  list: {},
  emptyText: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    fontWeight: 700,
  },
});

interface Props {
  notifications: Linode.Notification[];
  closeMenu: () => void;
}

interface State { }

type CombinedProps = Props & RouteComponentProps<void> & WithStyles<ClassNames>;

class UserNotificationsList extends React.Component<CombinedProps, State> {
  state: State = {};

  render() {
    const { classes, notifications, closeMenu, history: { push } } = this.props;


    if (notifications.length === 0) {
      return <Typography className={classes.emptyText}>You have no notifications.</Typography>
    }

    return (notifications || []).map((notification, idx) => {
      const level = pathOr('warning', [notification.severity], severityMap);
      const onClick = createClickHandlerForNotification(
        notification,
        (path: string) => {
          closeMenu();
          push(path);
        });
      return React.createElement(Notice, {
        key: idx,
        children: notification.message,
        className: classNames({
          [classes.root]: true,
          notifications: true,
          [classes.pointer]: Boolean(onClick),
        }),
        [level]: true,
        notificationList: true,
        onClick
      });
    });
  }
}

const createClickHandlerForNotification =
  (notification: null | Linode.Notification, onClick: (path: string) => void) => {
    if(!notification){ return; }

    /**
     * Privacy poliicy changes can only be made in CF manager for now, so we have to
     * link externally.
     */
    if(notification.type === 'notice' && notification.label === `We've updated our policies.`){
      return (e: React.MouseEvent<HTMLElement>) => {
        window.location.href = `https://manager.linode.com/account/policy`;
      };
    }

    const type = path<string>(['entity', 'type'], notification);
    const id = path<number>(['entity', 'id'], notification);

    if (!type || !id) { return; }


    switch (type) {
      case 'linode':
        return (e: React.MouseEvent<HTMLElement>) => onClick(`/linodes/${id}`);

      case 'ticket':
        return (e: React.MouseEvent<HTMLElement>) => onClick(`/support/ticket/${id}`);
      
      default:
        return;
    }

  };

const severityMap = {
  minor: 'success',
  major: 'warning',
  critical: 'error',
};

const styled = withStyles(styles, { withTheme: true });

const enhanced = compose<any, any, any>(styled, withRouter);

export default enhanced(UserNotificationsList);
