import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import { events } from '~/api';
import { eventRead } from '~/api/events';
import Polling from '~/api/polling';
import {
  createHeaderFilter,
  greaterThanDatetimeFilter,
  lessThanDatetimeFilter,
  lessThanNowFilter,
} from '~/api/util';
import { EVENT_POLLING_DELAY } from '~/constants';

import NotificationList from './NotificationList';


const MIN_SHOWN_EVENTS = 10;
const POLLING_ID = 'events';
const FIVE_MINUTES = 5 * 60 * 1000;

let filterOptions = { seen: false };
const fetchAllEvents = () => (dispatch) =>
  dispatch(events.all([], null, createHeaderFilter(filterOptions)));

const POLLING = Polling({
  apiRequestFn: fetchAllEvents,
  timeout: EVENT_POLLING_DELAY,
  backoff: true,
  maxBackoffTimeout: FIVE_MINUTES,
});

export class Notifications extends Component {
  constructor(props) {
    super(props);

    this.onClickItem = this.onClickItem.bind(this);
    this.onClickShowMore = this.onClickShowMore.bind(this);
    this.state = { loadingMore: false };
  }

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
      this.fetchEventsPage(lessThanNowFilter('created'));
    }

    // initialize polling for unseen events
    dispatch(POLLING.start(POLLING_ID));
  }

  componentWillUpdate(nextProps) {
    const { dispatch } = this.props;
    const { events, eventTriggeringRequests } = nextProps;

    const actionExpectingEvent = eventTriggeringRequests > this.props.eventTriggeringRequests;
    // total results is relative to the last filtered request
    // TODO: review api structure to account for totalResults seen all time vs in last request
    if (events.totalResults > 0 || actionExpectingEvent) {
      const latest = events.events[events.ids[0]];
      filterOptions = {
        ...filterOptions,
        ...greaterThanDatetimeFilter('created', latest.created),
      };
      POLLING.reset();
    }

    if (actionExpectingEvent) {
      dispatch(POLLING.start(POLLING_ID));
    }
  }

  componentWillUnmount() {
    POLLING.stop(POLLING_ID);
  }

  async onClickItem(event) {
    const { dispatch } = this.props;

    if (!event.read) {
      await dispatch(eventRead(event.id));
    }
  }

  onClickShowMore(e) {
    e.stopPropagation(); // don't let the toggle close the list
    const { events } = this.props;

    const currentOldestCreatedDate = events.events[events.ids[events.ids.length - 1]].created;
    this.setState({ loading: true });
    this.fetchEventsPage(createHeaderFilter({
      seen: true,
      ...lessThanDatetimeFilter('created', currentOldestCreatedDate),
    }));
    this.setState({ loading: false });
  }

  fetchEventsPage(options = null) {
    const { dispatch } = this.props;
    return dispatch(events.page(0, [], null, true, null, options));
  }

  render() {
    const { events, notifications = { open: false } } = this.props;

    return (
      <NotificationList
        events={events}
        loading={this.state.loading}
        open={notifications.open}
        onClickItem={this.onClickItem}
        onClickShowMore={this.onClickShowMore}
      />
    );
  }
}

Notifications.propTypes = {
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.object,
  notifications: PropTypes.object.isRequired,
  eventTriggeringRequests: PropTypes.number.isRequired,
};


function select(state) {
  return {
    eventTriggeringRequests: state.events.eventTriggeringRequests,
    notifications: state.notifications,
    events: state.api.events,
  };
}

export default connect(select)(Notifications);
