import browser from 'browser-detect';
import { compose } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';

import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import MenuItem from 'src/components/MenuItem';
import GDPRNotification from 'src/GDPRNotification';
import UserAgentNotification from 'src/UserAgentNotification';

import UserNotificationButton from './UserNotificationsButton';
import UserNotificationsList from './UserNotificationsList';

type ClassNames = 'root'
  | 'dropDown'
  | 'hidden';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    transform: `translate(-${theme.spacing.unit}px, ${theme.spacing.unit}px)`,
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
      ...theme.notificationList,
      ...theme.typography.subheading,
      '& p': {
        ...theme.typography.subheading,
      },
    },
  },
  hidden: {
    height: 0,
    padding: 0,
  },
});

interface State {
  anchorEl?: HTMLElement;
  privacyPolicyModalOpen: boolean;
  UserAgentNotification: boolean;
  UserAgentNotificationWarning: any;
}

type CombinedProps =
  StateProps
  & WithStyles<ClassNames>;

const b = typeof browser === "function" ? browser() : () => ({ name: 'unknown' });

const userAgentDetection = () => {
  switch (b.name) {
    case "ie":
      return (
        <Typography>
          Your Web Browser (<strong>{b.name}</strong>) is not compatible with the Linode Manager.
          Please update to <a href="https://www.microsoft.com/en-us/windows/microsoft-edge" target="_blank">Miscrosoft Edge</a> for more security,
          speed and the best experience on this site.
        </Typography>
      )
    default:
      return undefined;
  }
}

class UserNotificationsMenu extends React.Component<CombinedProps, State> {
  static displayedEvents: Linode.NotificationType[] = [
    'outage',
    'payment_due',
    'ticket_important',
    'ticket_abuse',
    'notice',
    'migration_pending',
    'migration_scheduled',
  ];

  state: State = {
    anchorEl: undefined,
    privacyPolicyModalOpen: false,
    UserAgentNotification: true,
    UserAgentNotificationWarning: false,
  };

  componentDidMount() {
    this.setState({
      UserAgentNotificationWarning: userAgentDetection()
    });
  }

  componentDidUpdate(prevProps: CombinedProps, prevState: State) {
    const { notifications } = this.props;

    if (notifications.length === 0) {
      return;
    }

    const privacyPolicyModalOpen = Boolean(notifications.find(isPrivacyPolicityNotification))

    /**
     * If the state differs, we know there was a change to notifications and we should display the
     * modal.
     */
    if (prevState.privacyPolicyModalOpen !== privacyPolicyModalOpen) {
      this.setState({ privacyPolicyModalOpen });
    }
  }

  closePrivacyPolicyModal = () => this.setState({ privacyPolicyModalOpen: false })
  closeUserAgentNotification = () => this.setState({ UserAgentNotification: false })

  render() {
    const { anchorEl, UserAgentNotificationWarning } = this.state;
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
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={this.closeMenu}
          className={classes.root}
          PaperProps={{ className: classes.dropDown }}
        >
          <MenuItem key="placeholder" className={classes.hidden} tabIndex={1} />
          <UserNotificationsList notifications={notifications} closeMenu={this.closeMenu} />
        </Menu>
        <GDPRNotification open={this.state.privacyPolicyModalOpen} onClose={this.closePrivacyPolicyModal} />
        {UserAgentNotificationWarning &&
          <UserAgentNotification
            open={this.state.UserAgentNotification}
            onClose={this.closeUserAgentNotification}
            warning={UserAgentNotificationWarning}
          />
        }
      </React.Fragment>
    );
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: e.currentTarget });

  closeMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: undefined })
}

const isPrivacyPolicityNotification = (n: Linode.Notification) =>
  n.type === `notice` && n.label === `We've updated our policies.`;

const reduceSeverity = (result: Linode.NotificationSeverity | null, { severity }: Linode.Notification) => {
  if (result === 'critical' || severity === 'critical') { return 'critical'; }
  if (result === 'major' || severity === 'major') { return 'major'; }
  if (result === 'minor' || severity === 'minor') { return 'minor'; }

  return result;
}

const styled = withStyles(styles, { withTheme: true });

interface StateProps {
  notifications: Linode.Notification[];
}

const mapStateToProps: MapStateToProps<StateProps, never, ApplicationState> = (state) => ({
  notifications: (state.notifications.data || [])
    .reduce((result: Linode.Notification[], notification) => {
      /** Filter out any notifications that do not meet our expectations. */
      if (
        !notification.message
        || !notification.label
        || !notification.type
        || !notification.severity
        || !UserNotificationsMenu.displayedEvents.includes(notification.type)
      ) {
        return result;
      }

      /** Update the language of the privacy policy update for usagea in the UNM. */
      if (isPrivacyPolicityNotification(notification)) {
        return [...result, { ...notification, message: `Click here to view the updated policies.`, }];
      }

      /** Remove the label from the message and trim the leading space. */
      return [
        ...result,
        {
          ...notification,
          message: notification.message.replace(notification.label, '').trimLeft(),
        },
      ];
    }, []),
});

const connected = connect(mapStateToProps);

const enhanced = compose(styled, connected);

export default enhanced(UserNotificationsMenu);
