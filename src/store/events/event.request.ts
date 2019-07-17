import * as moment from 'moment';
import {
  getEvents as _getEvents,
  markEventSeen
} from 'src/services/account/events';
import { dateFormat } from 'src/time';
import { hideBlacklistedEvents } from 'src/utilities/eventUtils';
import { generatePollingFilter } from 'src/utilities/requestFilters';
import { ThunkActionCreator } from '../types';
import { addEvents, updateEventsAsSeen } from './event.actions';
import { epoch } from './event.helpers';

/**
 * Will send a filtered request for events which have been created after the most recent existing
 * event or the epoch if there are no stored events.
 */
export const getEvents: ThunkActionCreator<Promise<Linode.Event[]>> = () => (
  dispatch,
  getState
) => {
  const { mostRecentEventTime, inProgressEvents } = getState().events;

  const filters = generatePollingFilter(
    moment.utc(mostRecentEventTime).format(dateFormat),
    Object.keys(inProgressEvents)
  );

  return (
    _getEvents({ page_size: 100 }, filters)
      .then(response => response.data)
      // This will remove globally blacklisted events, which will not appear anywhere in the app.
      .then(hideBlacklistedEvents)
      /**
       * There is where we set _initial on the events. In the default state of events the
       * mostRecentEventTime is set to epoch. On the completion of the first successful events
       * update the mostRecentEventTime is updated, meaning it's impossible for subsequent events
       * to be incorrectly marked as _initial. This addresses our reappearing toast issue.
       */
      .then(events =>
        events.map(e => ({ ...e, _initial: mostRecentEventTime === epoch }))
      )
      .then(events => {
        if (events.length > 0) {
          dispatch(addEvents(events));
        }
        return events;
      })
      .catch(e => [])
  );
};

/**
 * Send a request to mark all currently stored events as seen, then call updateEventsAsSeen which
 * iterates the events and marks them seen.
 */
export const markAllSeen: ThunkActionCreator<Promise<any>> = () => (
  dispatch,
  getState
) => {
  const {
    events: { events }
  } = getState();
  /** */
  const latestId = events.reduce(
    (result, { id }) => (id > result ? id : result),
    0
  );

  return markEventSeen(latestId)
    .then(() => dispatch(updateEventsAsSeen()))
    .catch(() => null);
};
