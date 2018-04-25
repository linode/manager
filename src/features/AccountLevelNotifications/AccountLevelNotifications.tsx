import * as React from 'react';
import { Subscription } from 'rxjs/Rx';
import {
  compose,
  prop,
  contains,
  filter,
  propSatisfies,
  uniqBy,
} from 'ramda';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import notifications$ from 'src/notifications';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
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
    'ticket_abuse',
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
    return (this.state.notifications || [])
      .map(notification =>
        <div key={notification.type}>{notification.message}</div>,
      );
  }
}

const styled = withStyles(styles, { withTheme: true });

export default styled(AccountLevelNotifications);
