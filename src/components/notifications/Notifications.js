import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';

import { EVENT_POLLING_DELAY } from '~/constants';
import { events } from '~/api';
import {
  createHeaderFilter,
  lessThanDatetimeFilter,
  lessThanNowFilter,
} from '~/api/util';
import Polling from '~/api/polling';

import { eventRead, eventSeen } from '~/api/events';
import { hideNotifications, showNotifications } from '~/actions/notifications';
import NotificationList from './NotificationList';

const MIN_SHOWN_EVENTS = 10;

export class Notifications extends Component {
  constructor(props) {
    super(props);

    this.toggleNotifications = this.toggleNotifications.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.onClickShowMore = this.onClickShowMore.bind(this);

    this._polling = Polling({
      apiRequestFn: this.fetchAllEvents.bind(this),
      filterOptions: { seen: false },
      timeout: EVENT_POLLING_DELAY,
    });
    this.state = { loadingMore: false };
  }

  async componentDidMount() {
    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }

    // begin by fetching all unseen events
    await this.fetchAllEvents(createHeaderFilter({ seen: false }));

    // if there are less than MIN_SHOWN_EVENTS returned from unseen events,
    // fetch any events earlier from now in order to fill out the event list
    if (this.props.events.totalResults <= MIN_SHOWN_EVENTS) {
      this.fetchEventsPage(lessThanNowFilter('created'));
    }

    // initialize polling for unseen events
    this._polling.start();
  }

  componentWillUnmount() {
    clearTimeout(this._pollingTimeoutId);
    this._pollingTimeoutId = null;
  }

  async onClickItem(event) {
    const { dispatch } = this.props;

    if (!event.read) {
      await dispatch(eventRead(event.id));
    }
  }

  async onClickShowMore(e) {
    e.stopPropagation(); // don't let the toggle close the list
    const { events } = this.props;

    const currentOldestCreatedDate = events.events[events.ids[events.ids.length - 1]].created;
    this.setState({ loading: true });
    await this.fetchEventsPage(
      createHeaderFilter(
        _.merge(
          { seen: true },
          lessThanDatetimeFilter('created', currentOldestCreatedDate)
        )
      )
    );
    this.setState({ loading: false });
  }

  toggleNotifications(e) {
    e.preventDefault();
    e.stopPropagation();
    const { dispatch, notifications, onMenuClick } = this.props;

    if (notifications.open) {
      dispatch(hideNotifications());
      onMenuClick(false);
    } else {
      this.markEventsSeen();
      dispatch(showNotifications());
      onMenuClick(true);
    }
  }

  async markEventsSeen() {
    const { dispatch, events } = this.props;
    const unseenIds = events.ids.filter(function (id) {
      return !events.events[id].seen;
    });

    // mark up to and including the most recent event seen
    if (unseenIds.length) {
      await dispatch(eventSeen(unseenIds[0]));
    }
  }

  async fetchEventsPage(options = null) {
    const { dispatch } = this.props;
    await dispatch(
      events.page(0, [], null, true, null, options)
    );
  }

  async fetchAllEvents(options = null) {
    const { dispatch } = this.props;
    await dispatch(events.all([], null, options));
  }

  render() {
    const { events, notifications = { open: false } } = this.props;

    const unseenCount = notifications.open ? 0 :
      events.ids.reduce(function (count, id) {
        return events.events[id].seen ? count : count + 1;
      }, 0);

    return (
      <div className="Notifications" onClick={this.toggleNotifications}>
        <i className="fa fa-bell-o"></i>
        {!unseenCount ? null : <span className="MainHeader-badge badge">{unseenCount}</span>}
        <NotificationList
          events={events}
          loading={this.state.loading}
          open={notifications.open}
          onClickItem={this.onClickItem}
          onClickShowMore={this.onClickShowMore}
        />
      </div>
    );
  }
}

Notifications.propTypes = {
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.object,
  notifications: PropTypes.object.isRequired,
  onMenuClick: PropTypes.func,
};


function select(state) {
  return {
    notifications: state.notifications,
    events: state.api.events,
  };
}

export default connect(select)(Notifications);
