import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from 'material-ui';
import { Subscription, Observable } from 'rxjs/Rx';
import { init } from 'ramda';
import * as moment from 'moment';

import IconButton from 'material-ui/IconButton';
import Notifications from 'material-ui-icons/Notifications';
import NotificationsNone from 'material-ui-icons/NotificationsNone';
import Menu from 'material-ui/Menu';
import eventTypes from 'src/eventTypes';

import EventListItem from 'src/components/EventListItem';

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
}

type CombinedProps = Props & WithStyles<ClassNames>;

class UserNotificationMenu extends React.Component<CombinedProps, State> {
  state = {
    anchorEl: undefined,
    events: [],
  };

  static defaultProps = {
    hasNew: false,
  };

  subscription: Subscription;

  componentDidMount() {
    this.subscription = events$
      .scan((acc, value) => {
        if (acc.length > 99) { /** @todo Magic number! */
          return [value, ...init(acc)];
        }

        return [value, ...acc];
      }, [])
      .debounce(() => Observable.interval(250))
      .subscribe(
        (events) => {
          this.setState({ events });
        },
        () => null,
      );
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    const { classes, hasNew } = this.props;
    const { anchorEl, events } = this.state;

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
