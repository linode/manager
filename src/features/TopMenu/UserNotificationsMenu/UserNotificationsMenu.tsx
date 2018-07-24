import { compose, contains, filter, propSatisfies } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';

import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import GDPRNotification from 'src/GDPRNotification';
import notifications$ from 'src/notifications';

import UserNotificationButton from './UserNotificationsButton';
import UserNotificationsList from './UserNotificationsList';

type ClassNames = 'root' | 'dropDown';

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
});

interface Props { }

interface State {
  anchorEl?: HTMLElement;
  notifications: Linode.Notification[];
  privacyPolicyModalOpen: boolean;
}

type CombinedProps = {} & WithStyles<ClassNames>;


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

  subscription: Subscription;

  state: State = {
    notifications: [],
    anchorEl: undefined,
    privacyPolicyModalOpen: false,
  };

  componentDidMount() {
    this.subscription = notifications$
      .map(filterNotifications)

      /** Update the language of the privacy policy update for usagea in the UNM. */
      .map((notifications) => notifications.map((n) => {
        return isPrivacyPolicityNotification(n)
        ? { ...n, message: `We've updated our policies. Click here to view the updated policies.`, }
        : n;
      }))
      .subscribe(notifications => {
        const updatedPrivacyPolicyNotification = notifications.find(isPrivacyPolicityNotification);

        this.setState({
          notifications,
          privacyPolicyModalOpen: Boolean(updatedPrivacyPolicyNotification),
        });
      });
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  closePrivacyPolicyModal = () => this.setState({ privacyPolicyModalOpen: false })

  render() {
    const { anchorEl, notifications } = this.state;
    const { classes } = this.props;
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
          <UserNotificationsList notifications={notifications} closeMenu={this.closeMenu} />
        </Menu>
        <GDPRNotification open={this.state.privacyPolicyModalOpen} onClose={this.closePrivacyPolicyModal} />
      </React.Fragment>
    );
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: e.currentTarget });

  closeMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: undefined })
}

const filterNotifications: (v: Linode.Notification[]) => Linode.Notification[] =
  compose<Linode.Notification[], Linode.Notification[]>(
    filter<Linode.Notification>(
      propSatisfies(v => contains(v, UserNotificationsMenu.displayedEvents), 'type'),
    ),
  );

const isPrivacyPolicityNotification = (n: Linode.Notification) =>
  n.type === `notice` && n.label === `We've updated our policies.`;

const reduceSeverity = (result: Linode.NotificationSeverity | null, { severity }: Linode.Notification) => {
  if (result === 'critical' || severity === 'critical') { return 'critical'; }
  if (result === 'major' || severity === 'major') { return 'major'; }
  if (result === 'minor' || severity === 'minor') { return 'minor'; }

  return result;
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationsMenu);
