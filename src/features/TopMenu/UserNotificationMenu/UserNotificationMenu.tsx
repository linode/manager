import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';
import { Subscription, Observable } from 'rxjs/Rx';
import { assoc, compose, sort, take, values } from 'ramda';
import * as moment from 'moment';

import Menu from '@material-ui/core/Menu';

import { events$, init } from 'src/events';
import notifications$ from 'src/notifications';
import { markEventsSeen } from 'src/services/account';
import UserNotificationButton from './UserNotificationButton';
import UserNotificationList from './UserNotificationList';

type ClassNames = 'root' | 'dropDown';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme & Linode.Theme) => ({
  root: {
    transform: `translate(-${theme.spacing.unit * 2}px, ${theme.spacing.unit}px)`,
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
  },
});

interface Props {
  [index: string]: any;
}

interface State {
  anchorEl?: HTMLElement;
  events: Linode.Event[];
  unseenCount?: number;
  notifications: Linode.Notification[];
}

type CombinedProps = {} & WithStyles<ClassNames>;

interface EventsMap {
  [index: string]: Linode.Event;
}

class UserNotificationMenu extends React.Component<CombinedProps, State> {
  state = {
    events: [],
    notifications: [],
    anchorEl: undefined,
    unseenCount: 0,
  };

  subscription: Subscription;

  mounted: boolean = false;

  static defaultProps = {
    unseenCount: 0,
  };

  componentDidMount() {
    this.mounted = true;
    this.subscription = Observable
      .combineLatest(
        notifications$,
        events$
          /** Filter the fuax event used to kick off the progress bars. */
          .filter((event: Linode.Event) => event.id !== 1)

          /** Create a map of the Events using Event.ID as the key. */
          .scan((events: EventsMap, event: Linode.Event) =>
            assoc(String(event.id), event, events), {}),
    )
      /** Wait for the events to settle before calling setState. */
      .debounce(() => Observable.interval(250))

      /** Notifications are fine, but the events need to be extracts and sorted. */
      .map(([notifications, events]) => {
        return [
          notifications,
          extractAndSortByCreated(events),
        ];
      })
      .subscribe(
        ([notifications, events]: [Linode.Notification[], Linode.Event[]]) => {
          if (!this.mounted) { return; }

          this.setState({
            unseenCount: getNumUnseenEvents(events),
            events,
            notifications,
          });
        },
        () => null,
    );

    Observable
      .fromEvent(this.buttonRef, 'click')
      .withLatestFrom(
        events$
          .filter(e => e.id !== 1)
          .map(e => e.id),
    )
      .subscribe(([e, id]) => {
        markEventsSeen(id)
          .then(() => init())
          .catch(console.error);
      });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.subscription.unsubscribe();
  }

  private buttonRef: HTMLElement;

  setRef = (element: HTMLElement) => {
    this.buttonRef = element;
  }

  render() {
    const { anchorEl, events, unseenCount, notifications } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <UserNotificationButton
          onClick={e => this.setState({ anchorEl: e.currentTarget })}
          getRef={this.setRef}
          notificationCount={unseenCount}
          disabled={notifications.length + events.length === 0}
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
          <UserNotificationList notifications={notifications} events={events} />
        </Menu>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const extractAndSortByCreated = compose(
  take(25),
  sort((a: Linode.Event, b: Linode.Event) => moment(b.created).diff(moment(a.created))),
  values,
);

const getNumUnseenEvents = (events: Linode.Event[]) => {
  const len = events.length;
  let unseenCount = 0;
  let idx = 0;
  while (idx < len) {
    if (!events[idx].seen) {
      unseenCount += 1;
    }

    idx += 1;
  }

  return unseenCount;
};

export default styled<Props>(UserNotificationMenu);
