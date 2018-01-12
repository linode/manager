import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { withRouter } from 'react-router-dom';

import { EVENT_POLLING_DELAY } from '~/constants';
import { eventRead } from '~/api/ad-hoc/events';
import {
  createHeaderFilter,
  lessThanDatetimeFilter,
  greaterThanDatetimeFilter,
  lessThanNowFilter,
} from '~/api/util';

import api from '~/api';
import { eventSeen } from '~/api/ad-hoc/events';
import Polling from '~/api/polling';
import { hideNotifications, showNotifications } from '~/actions/notifications';
import NotificationList from './NotificationList';
const MIN_SHOWN_EVENTS = 10;
const POLLING_ID = 'events';
const FIVE_MINUTES = 5 * 60 * 1000;

let filterOptions = { seen: false };
const fetchAllEvents = () => (dispatch) =>
  dispatch(api.events.all([], null, createHeaderFilter(filterOptions)));

const POLLING = Polling({
  apiRequestFn: fetchAllEvents,
  timeout: EVENT_POLLING_DELAY,
  backoff: true,
  maxBackoffTimeout: FIVE_MINUTES,
});

async function markEventsSeen(dispatch, events) {
  const unseenIds = events.ids.filter(function (id) {
    return !events.events[id].seen;
  });

  // mark up to and including the most recent event seen
  if (unseenIds.length) {
    await dispatch(eventSeen(unseenIds[0]));
  }
}

class Notifications extends Component {
  state = { loading: false }
  async componentDidMount() {
    const { dispatch } = this.props;

    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }

    // begin by fetching all unseen events
    await dispatch(fetchAllEvents());

    // if there are less than MIN_SHOWN_EVENTS returned from unseen events,
    // fetch any events earlier from now in order to fill out the event list
    if (this.props.events.totalResults <= MIN_SHOWN_EVENTS) {
      this.props.fetchEventsPage(createHeaderFilter(lessThanNowFilter('created')));
    }

    // initialize polling for unseen events
    dispatch(POLLING.start(POLLING_ID));
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props, nextProps)
      || !isEqual(this.state, nextState);
  }

  componentWillUpdate(nextProps) {
    const { dispatch } = this.props;
    const { events, eventTriggeringRequests } = nextProps;

    const actionExpectingEvent = eventTriggeringRequests > this.props.eventTriggeringRequests;
    // total results is relative to the last filtered request
    // TODO: review api structure to account for totalResults seen all time vs in last request
    if (events.totalResults > 0 || actionExpectingEvent) {
      if (events.ids[0]) {
        const latest = events.events[events.ids[0]];
        filterOptions = {
          ...filterOptions,
          ...greaterThanDatetimeFilter('created', latest.created),
        };
      }
      POLLING.reset();
    }

    if (actionExpectingEvent) {
      dispatch(POLLING.start(POLLING_ID));
    }
  }

  componentWillUnmount() {
    POLLING.stop(POLLING_ID);
  }

  onClickItem = async event => {
    const { dispatch } = this.props;

    if (!event.read) {
      await dispatch(eventRead(event.id));
    }
  };

  onClickShowMore = e => {
    e.stopPropagation(); // don't let the toggle close the list
    const { events } = this.props;

    const currentOldestCreatedDate = events.events[events.ids[events.ids.length - 1]].created;
    this.setState({ loading: true });
    this.fetchEventsPage(createHeaderFilter({
      seen: true,
      ...lessThanDatetimeFilter('created', currentOldestCreatedDate),
    }));
    this.setState({ loading: false });
  };

  fetchEventsPage(headers = null) {
    const { dispatch } = this.props;
    return dispatch(api.events.page(0, [], null, true, null, headers));
  }

  render() {
    const { events, unseenCount, toggleMenu, menuStatus } = this.props;

    return (
      <div
        className="MainHeader-notifications"
        onClick={() => toggleMenu(menuStatus, events)}
      >
        <i className="fa fa-bell-o" />
        {!unseenCount ? null : (
          <span className="MainHeader-badge Badge">{unseenCount}</span>
        )}
        <NotificationList
          loading={this.state.loading}
          onClickItem={this.onClickItem}
          onClickShowMore={this.onClickShowMore}
        />
      </div>
    );
  }
}

Notifications.propTypes = {
  dispatch: PropTypes.func.isRequired,
  unseenCount: PropTypes.number.isRequired,
  menuStatus: PropTypes.bool.isRequired,
  toggleMenu: PropTypes.func.isRequired,
  events: PropTypes.object, // @todo Document shape of event(s)
  eventTriggeringRequests: PropTypes.number.isRequired,
  fetchEventsPage: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

Notifications.defaultProps = {
  events: { ids: {} },
};

const mapStateToProps = (state) => ({
  unseenCount: state.notifications.open
    ? 0
    : state.api.events.ids.reduce(function (count, id) {
      return state.api.events.events[id].seen ? count : count + 1;
    }, 0),
  menuStatus: state.notifications.open,
  events: state.api.events,
  eventTriggeringRequests: state.events.eventTriggeringRequests,
  isAuthenticated: Boolean(state.authentication.token),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  toggleMenu: function (status, events) {
    if (status) {
      dispatch(hideNotifications());
    } else {
      markEventsSeen(dispatch, events);
      dispatch(showNotifications());
    }
  },
  fetchEventsPage(headers = null) {
    return dispatch(api.events.page(0, [], null, true, null, headers));
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withRouter,
)(Notifications);
