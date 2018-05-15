import * as React from 'react';
import { Subscription } from 'rxjs/Rx';
import {
  compose,
  contains,
  filter,
  pathOr,
  prop,
  propSatisfies,
  uniqBy,
} from 'ramda';

import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';

import notifications$ from 'src/notifications';
import Notice from 'src/components/Notice';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
    justifyContent: 'center',
    padding: theme.spacing.unit,
    textAlign: 'center',
    '&:first-child': {
      marginTop: theme.spacing.unit,
    },
    '& p': {
      fontSize: '1.1rem',
      color: '#333',
    },
  },
});

interface Props { }

interface State {
  notifications?: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const filterNotifications: (v: Linode.Notification[]) => Linode.Notification[] =
  compose<Linode.Notification[], Linode.Notification[], Linode.Notification[]>(
    uniqBy(prop('type')),
    filter<Linode.Notification>(
      propSatisfies(v => contains(v, AccountLevelNotifications.displayedEvents), 'type'),
    ),
  );

class AccountLevelNotifications extends React.Component<CombinedProps, State> {
  state: State = {
  };

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
        className: classes.root,
        [level]: true,
        children: undefined,
      });
    });
  }
}

const severityMap = {
  minor: 'success',
  major: 'warning',
  critical: 'error',
};

const styled = withStyles(styles, { withTheme: true });

export default styled(AccountLevelNotifications);
