import { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import isEqual from 'lodash/isEqual';

import { withRouter } from 'react-router-dom';
import api from '~/api';
import Polling from '~/api/polling';
import { lessThanNowFilter } from '~/api/lessThanDateFilter';
import { createHeaderFilter, greaterThanDatetimeFilter } from '~/api/util';
import { EVENT_POLLING_DELAY } from '~/constants';

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

class PollingWrapper extends Component {
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

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.events, nextProps.events)
      || this.props.eventTriggeringRequests !== nextProps.eventTriggeringRequests
      || this.props.location !== nextProps.location;
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

  render() {
    return null;
  }
}

PollingWrapper.propTypes = {
  dispatch: PropTypes.func.isRequired,
  eventTriggeringRequests: PropTypes.number.isRequired,
  fetchEventsPage: PropTypes.func.isRequired,
  events: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  events: state.api.events,
  eventTriggeringRequests: state.events.eventTriggeringRequests,
  isAuthenticated: Boolean(state.authentication.token),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  fetchEventsPage(headers = null) {
    return dispatch(api.events.page(0, [], null, headers));
  },
});
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PollingWrapper));
