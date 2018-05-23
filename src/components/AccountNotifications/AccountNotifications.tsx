import * as React from 'react';
import { Subscription } from 'rxjs/Subscription';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Menu from 'material-ui/Menu';

import AccountLevelNotifications from 'src/features/AccountLevelNotifications';
import UserNotificationButton from './AccountNotificationsButton';
import notifications$ from 'src/notifications';

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

const IMPORTANT: Linode.NotificationType[] = [
  'outage',
  'payment_due',
  'ticket_important',
  'ticket_abuse',
  'notice',
];

class AccountNotificationMenu extends React.Component<CombinedProps, State> {
  subscription: Subscription;

  state: State = {
    notifications: [],
    anchorEl: undefined,
  };

  componentDidMount() {
    this.subscription =
      notifications$
        .subscribe(notifications => this.setState({ notifications }));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { anchorEl, notifications } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <UserNotificationButton
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
          className={anchorEl ? 'active' : ''}
          isImportant={notifications.reduce((prev, current) =>
            prev || IMPORTANT.includes(current.type), false)}
          allRead={notifications.length === 0}
        />
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={() => this.setState({ anchorEl: undefined })}
          className={classes.root}
          PaperProps={{ className: classes.dropDown }}
        >
          <AccountLevelNotifications />
        </Menu>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(AccountNotificationMenu);
