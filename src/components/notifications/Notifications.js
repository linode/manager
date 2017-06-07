import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';

import { EVENT_POLLING_DELAY } from '~/constants';
import { events } from '~/api';
import {
  createHeaderFilter,
  greaterThanDatetimeFilter,
  lessThanDatetimeFilter,
  lessThanNowFilter,
} from '~/api/util';
import Polling from '~/api/polling';

import { eventRead } from '~/api/events';
import NotificationList from './NotificationList';

const MIN_SHOWN_EVENTS = 10;
const POLLING_ID = 'events';


export class Notifications extends Component {
  constructor(props) {
    super(props);

    this.onClickItem = this.onClickItem.bind(this);
    this.onClickShowMore = this.onClickShowMore.bind(this);

    this._filterOptions = { seen: false };
    this._polling = Polling({
      apiRequestFn: this.fetchAllEvents.bind(this),
      timeout: EVENT_POLLING_DELAY,
      backoff: true,
      maxBackoffTimeout: (5 * 60 * 1000), // 5 minutes
    });
    this.state = { loadingMore: false };
  }

  async componentDidMount() {
    const { dispatch } = this.props;

    // OAuth token is not available during the callback
    while (window.location.pathname === '/oauth/callback') {
      await new Promise(r => setTimeout(r, 100));
    }

    // begin by fetching all unseen events
    await dispatch(this.fetchAllEvents(createHeaderFilter({ seen: false })));

    // if there are less than MIN_SHOWN_EVENTS returned from unseen events,
    // fetch any events earlier from now in order to fill out the event list
    if (this.props.events.totalResults <= MIN_SHOWN_EVENTS) {
      this.fetchEventsPage(lessThanNowFilter('created'));
    }

    // initialize polling for unseen events
    dispatch(this._polling.start(POLLING_ID));
  }

  componentWillUpdate(nextProps) {
    const { events } = nextProps;

    // total results is relative to the last filtered request
    // TODO: review api structure to account for totalResults seen all time vs in last request
    if (events.totalResults > 0) {
      const latest = events.events[events.ids[0]];
      this._filterOptions = _.merge(
        {},
        this._filterOptions,
        greaterThanDatetimeFilter('created', latest.created)
      );
      this._polling.reset();
    }
  }

  componentWillUnmount() {
    this._polling.stop(POLLING_ID);
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

  async fetchEventsPage(options = null) {
    const { dispatch } = this.props;
    await dispatch(
      events.page(0, [], null, true, null, options)
    );
  }

  fetchAllEvents() {
    return async (dispatch) =>
      await dispatch(events.all([], null, createHeaderFilter(this._filterOptions)));
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
};


function select(state) {
  return {
    notifications: state.notifications,
    events: state.api.events,
  };
}

export default connect(select)(Notifications);
