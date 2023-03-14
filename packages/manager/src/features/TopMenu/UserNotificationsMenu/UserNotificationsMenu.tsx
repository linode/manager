import {
  Notification,
  NotificationSeverity,
  NotificationType,
} from '@linode/api-v4/lib/account';
import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Menu from 'src/components/core/Menu';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import MenuItem from 'src/components/MenuItem';
import { MapState } from 'src/store/types';
import UserNotificationButton from './UserNotificationsButton';
import UserNotificationsList from './UserNotificationsList';

type ClassNames = 'root' | 'dropDown' | 'hidden';

const styles = (theme: Theme) =>
  createStyles({
    root: {
      transform: `translate(-${theme.spacing(1)}, ${theme.spacing(1)})`,
    },
    dropDown: {
      position: 'absolute',
      outline: 0,
      boxShadow: `0 0 5px ${theme.color.boxShadow}`,
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: 16,
      width: 250,
      maxHeight: 300,
      [theme.breakpoints.up('sm')]: {
        width: 380,
      },
      '& .notification': {
        margin: 0,
        padding: '16px 32px 16px 23px',
        borderBottom:
          theme.name === 'dark' ? '1px solid #f4f4f4' : '1px solid #fbfbfb',
        transition: 'background-color 225ms ease-in-out',
        '&:hover': {
          backgroundColor: theme.name === 'dark' ? '#111111' : '#f4f4f4',
        },
        ...theme.typography.h3,
        '& p': {
          ...theme.typography.h3,
        },
      },
    },
    hidden: {
      ...theme.visually.hidden,
    },
  });

interface State {
  anchorEl?: HTMLElement;
}

type CombinedProps = StateProps & WithStyles<ClassNames>;

class UserNotificationsMenu extends React.Component<CombinedProps, State> {
  static displayedEvents: NotificationType[] = [
    'outage',
    'payment_due',
    'ticket_important',
    'ticket_abuse',
    'maintenance',
    'notice',
    'migration_pending',
    'migration_scheduled',
  ];

  state: State = {
    anchorEl: undefined,
  };

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { notifications } = this.props;

    if (notifications.length === 0) {
      return;
    }
  }

  render() {
    const { anchorEl } = this.state;
    const { classes, notifications } = this.props;
    const severity = notifications.reduce(reduceSeverity, null);

    return (
      <React.Fragment>
        <UserNotificationButton
          onClick={this.openMenu}
          className={anchorEl ? 'active' : ''}
          severity={severity}
          notifications={notifications}
        />
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.closeMenu}
          className={classes.root}
          PaperProps={{ className: classes.dropDown }}
        >
          <MenuItem
            key="placeholder"
            aria-hidden
            className={classes.hidden}
            tabIndex={0}
          />
          <UserNotificationsList
            notifications={notifications}
            closeMenu={this.closeMenu}
          />
        </Menu>
      </React.Fragment>
    );
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: e.currentTarget });

  closeMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: undefined });
}

const isPrivacyPolicyNotification = (n: Notification) =>
  n.type === `notice` && n.label === `We've updated our policies.`;

const reduceSeverity = (
  result: NotificationSeverity | null,
  { severity, type }: Notification
) => {
  if (result === 'major' || severity === 'major' || type === 'maintenance') {
    return 'major';
  }
  if (result === 'critical' || severity === 'critical') {
    return 'critical';
  }
  if (result === 'minor' || severity === 'minor') {
    return 'minor';
  }

  return result;
};

const styled = withStyles(styles);

interface StateProps {
  notifications: Notification[];
}

const mapStateToProps: MapState<StateProps, {}> = (state) => ({
  notifications: (state.__resources.notifications.data || []).reduce(
    (result: Notification[], notification) => {
      /** Filter out any notifications that do not meet our expectations. */
      if (
        !notification.message ||
        !notification.label ||
        !notification.type ||
        !notification.severity ||
        !UserNotificationsMenu.displayedEvents.includes(notification.type)
      ) {
        return result;
      }

      /** Update the language of the privacy policy update for usagea in the UNM. */
      if (isPrivacyPolicyNotification(notification)) {
        return [
          ...result,
          {
            ...notification,
            message: `An account administrator must accept the policies at login.linode.com/policies.`,
          },
        ];
      }

      /** Remove the label from the message and trim the leading space. */
      return [
        ...result,
        {
          ...notification,
          message: notification.message
            .replace(notification.label, '')
            .trimLeft(),
        },
      ];
    },
    []
  ),
});

const connected = connect(mapStateToProps);

const enhanced = compose<CombinedProps, {}>(styled, connected);

export default enhanced(UserNotificationsMenu);
