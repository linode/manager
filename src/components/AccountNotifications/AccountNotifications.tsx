import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import Menu from 'material-ui/Menu';

import AccountLevelNotifications from 'src/features/AccountLevelNotifications';
import UserNotificationButton from './AccountNotificationsButton';

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

interface Props {
  [index: string]: any;
}

interface State {
  anchorEl?: HTMLElement;
  events: Linode.Event[];
  hasNew?: boolean;
  notifications: Linode.Notification[];
}

type CombinedProps = {} & WithStyles<ClassNames>;

class AccountNotificationMenu extends React.Component<CombinedProps, State> {
  state = {
    events: [],
    notifications: [],
    anchorEl: undefined,
    hasNew: false,
  };

  mounted: boolean = false;

  static defaultProps = {
    hasNew: false,
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { anchorEl } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <UserNotificationButton
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
          className={anchorEl ? 'active' : ''}
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
