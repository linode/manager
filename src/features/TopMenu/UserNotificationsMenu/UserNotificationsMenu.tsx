import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import { compose, contains, filter, propSatisfies } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';
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
}

type CombinedProps = {} & WithStyles<ClassNames>;


class UserNotificationsMenu extends React.Component<CombinedProps, State> {
  static displayedEvents: Linode.NotificationType[] = [
    'outage',
    'payment_due',
    'ticket_important',
    'ticket_abuse',
    'notice',
  ];

  subscription: Subscription;

  state: State = {
    notifications: [],
    anchorEl: undefined,
  };

  componentDidMount() {
    this.subscription = notifications$
      .map(filterNotifications)
      .subscribe(notifications => this.setState({ notifications }));
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

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

const reduceSeverity = (result: Linode.NotificationSeverity | null, { severity }: Linode.Notification) => {
  if (result === 'critical' || severity === 'critical') { return 'critical'; }
  if (result === 'major' || severity === 'major') { return 'major'; }
  if (result === 'minor' || severity === 'minor') { return 'minor'; }

  return result;
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(UserNotificationsMenu);
