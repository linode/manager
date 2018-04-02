import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import { Subscription, Observable } from 'rxjs/Rx';
import { init, take } from 'ramda';
import * as moment from 'moment';
import Axios from 'axios';

import IconButton from 'material-ui/IconButton';
import Notifications from 'material-ui-icons/Notifications';
import NotificationsNone from 'material-ui-icons/NotificationsNone';
import Menu from 'material-ui/Menu';

import { API_ROOT } from 'src/constants';
import EventListItem from 'src/components/EventListItem';
import eventTypes from 'src/eventTypes';
import { events$ } from 'src/events';

type ClassNames = 'root' | 'icon';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  icon: { fontSize: '31px' },
});

interface Props {
  hasNew?: boolean;
}

interface State {
  anchorEl?: HTMLElement;
  events: Linode.Event[];
  notifications: Linode.Notification[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserNotificationMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    events: [],
    notifications: [],
  };

  static defaultProps = {
    hasNew: false,
  };

  subscription: Subscription;

  componentDidMount() {
    this.subscription = Observable
      .combineLatest(
        Observable.defer(() =>
          Axios.get(`${API_ROOT}/account/notifications`).then(response => response.data.data)),
        events$
          .scan((acc, value) => {
            return [value, ...(acc.length > 99 ? init(acc) : acc)];
          }, []),
        )
      .debounce(() => Observable.interval(250))
      .subscribe(
        ([notifications, events]) => {
          this.setState({
            events: take(100 - notifications.length, events),
            notifications,
          });
        },
        () => null,
      );
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const { classes, hasNew } = this.props;
    const { anchorEl, events, notifications } = this.state;

    const Icon = hasNew ? Notifications : NotificationsNone;

    return (
      <React.Fragment>
        <IconButton onClick={e => this.setState({ anchorEl: e.currentTarget })}>
          <Icon className={classes.icon} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          getContentAnchorEl={undefined}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={() => this.setState({ anchorEl: undefined })}
        >
        {
          /**
           * @todo Mapping minor/major/critital severity to colors for display.
           */
          (notifications as Linode.Notification[]).map((notification, idx) =>
          <EventListItem key={idx} title={notification.label} />)
        }
        {
          (events as Linode.Event[]).map((event, idx) =>
          <EventListItem
            key={idx}
            title={createEventTitle(event)}
            success={!event.seen}
            content={createEventBody(event)}
          />)
        }
        </Menu>
      </React.Fragment>
    );
  }
}

/** Who did what? */
function createEventTitle(event:Linode.Event): string {
  const verb = eventTypes[event.action].pastTenseAction;
  const subject = (event.entity && event.entity.label) || '';

  return `${event.username} ${verb} ${subject}`;
}

/** When */
function createEventBody(event:Linode.Event): string {
  return moment(`${event.created}Z`).fromNow();
}

const styled = withStyles(styles, { withTheme: true });

export default styled(UserNotificationMenu);
