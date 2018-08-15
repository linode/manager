// import * as moment from 'moment';
// import { assoc, compose, sort, take, values } from 'ramda';
import * as React from 'react';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/fromEvent'
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/debounce';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/withLatestFrom';
// import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import ListItem from '@material-ui/core/ListItem';
import Menu from '@material-ui/core/Menu';
import { StyleRulesCallback, Theme, withStyles, WithStyles } from '@material-ui/core/styles';

// import { events$, init } from 'src/events';
// import { markEventsSeen } from 'src/services/account';

import UserEventsButton from './UserEventsButton';
import UserEventsList from './UserEventsList';

type ClassNames = 'root'
  | 'dropDown'
  | 'hidden';

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
  hidden: {
    height: 0,
    padding: 0,
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

// interface EventsMap {
//   [index: string]: Linode.Event;
// }

class UserEventsMenu extends React.Component<CombinedProps, State> {
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
    // this.subscription = events$
    //   /** Filter the fuax event used to kick off the progress bars. */
    //   .filter((event: Linode.Event) => event.id !== 1)

    //   /** Create a map of the Events using Event.ID as the key. */
    //   .scan((events: EventsMap, event: Linode.Event) =>
    //     assoc(String(event.id), event, events), {})

    //   /** Wait for the events to settle before calling setState. */
    //   .debounce(() => Observable.interval(250))

    //   /** Notifications are fine, but the events need to be extracts and sorted. */
    //   .map(extractAndSortByCreated)
    //   .subscribe(
    //     (events: Linode.Event[]) => {
    //       if (!this.mounted) { return; }
    //       this.setState({
    //         unseenCount: getNumUnseenEvents(events),
    //         events,
    //       });
    //     },
    //     () => null,
    // );

    // Observable
    //   .fromEvent(this.buttonRef, 'click')
    //   .withLatestFrom(
    //     events$
    //       .filter(e => e.id !== 1)
    //       .map(e => e.id),
    // )
    //   .subscribe(([e, id]) => {
    //     markEventsSeen(id)
    //       .then(() => init())
    //       .catch(console.error);
    //   });
  }

  componentWillUnmount() {
    this.mounted = false;
    // this.subscription.unsubscribe();
  }

  buttonRef: HTMLElement;

  setRef = (element: HTMLElement) => {
    this.buttonRef = element;
  }

  render() {
    const { anchorEl, events, unseenCount } = this.state;
    const { classes } = this.props;

    return (
      <React.Fragment>
        <UserEventsButton
          onClick={this.openMenu}
          getRef={this.setRef}
          count={unseenCount}
          disabled={events.length === 0}
          className={anchorEl ? 'active' : ''}
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
          <ListItem key="placeholder" className={classes.hidden} tabIndex={1} />
          <UserEventsList
            events={events}
            closeMenu={this.closeMenu}
          />
        </Menu>
      </React.Fragment>
    );
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: e.currentTarget });

  closeMenu = (e: React.MouseEvent<HTMLElement>) =>
    this.setState({ anchorEl: undefined })
}

const styled = withStyles(styles, { withTheme: true });

// const extractAndSortByCreated = compose(
//   take(25),
//   sort((a: Linode.Event, b: Linode.Event) => moment(b.created).diff(moment(a.created))),
//   values,
// );

// const getNumUnseenEvents = (events: Linode.Event[]) => {
//   const len = events.length;
//   let unseenCount = 0;
//   let idx = 0;
//   while (idx < len) {
//     if (!events[idx].seen) {
//       unseenCount += 1;
//     }

//     idx += 1;
//   }

//   return unseenCount;
// };

export default styled<Props>(UserEventsMenu);
