import { compose, contains, filter, pathOr, propSatisfies } from 'ramda';
import * as React from 'react';
import 'rxjs/add/operator/map';
import { Subscription } from 'rxjs/Subscription';

import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

import Notice from 'src/components/Notice';
import notifications$ from 'src/notifications';

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

interface Props {}

interface State {
  notifications?: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserNotificationsList extends React.Component<CombinedProps, State> {
  state: State = {};

  subscription: Subscription;

  static displayedEvents = [
    'outage',
    'payment_due',
    'ticket_important',
    'ticket_abuse',
    'notice',
  ];

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
    const { classes } = this.props;

    return (this.state.notifications || []).map((n) => {
      const level = pathOr('warning', [n.severity], severityMap);

      return React.createElement(Notice, {
        key: n.type,
        html: n.message,
        className: `${classes.root} ${'notification'}`,
        [level]: true,
        children: undefined,
        notificationList: true,
      });
    });
  }
}

const filterNotifications: (v: Linode.Notification[]) => Linode.Notification[] =
  compose<Linode.Notification[], Linode.Notification[]>(
    filter<Linode.Notification>(
      propSatisfies(v => contains(v, UserNotificationsList.displayedEvents), 'type'),
    ),
  );

const severityMap = {
  minor: 'success',
  major: 'warning',
  critical: 'error',
};

const styled = withStyles(styles, { withTheme: true });

export default styled(UserNotificationsList);
