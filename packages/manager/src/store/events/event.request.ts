import {
  Event,
  getEvents as _getEvents,
  markEventSeen,
} from '@linode/api-v4/lib/account';
import { DateTime } from 'luxon';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { generatePollingFilter } from 'src/utilities/requestFilters';
import { ThunkActionCreator } from '../types';
import { addEvents, updateEventsAsSeen } from './event.actions';
import { epoch, isInProgressEvent } from './event.helpers';
import { parseAPIDate } from 'src/utilities/date';

/**
 * Will send a filtered request for events which have been created on or after the most recent existing
 * event or the epoch if there are no stored events. Exclude events already in memory with a "+neq" filter.
 */
export const getEvents: ThunkActionCreator<Promise<Event[]>> = () => (
  dispatch,
  getState
) => {
  const {
    mostRecentEventTime,
    inProgressEvents,
    events: _events,
  } = getState().events;

  // Regardless of date created, we request events that are still in-progress.
  const inIds = Object.keys(inProgressEvents).map((thisId) => +thisId);

  // Generate a list of event IDs for the "+neq" filter. We want to request events created
  // on or after the most recent created date, minus any events we've already requested.
  // This is to catch any events that may be "lost" if the request/query lands at just the
  // right moment such that we receive some events with a specific created date, but not all.
  const neqIds: number[] = [];
  if (_events.length > 0) {
    _events.forEach((thisEvent) => {
      const thisEventCreated = parseAPIDate(thisEvent.created).valueOf();

      if (
        thisEventCreated === mostRecentEventTime &&
        !isInProgressEvent(thisEvent)
      ) {
        neqIds.push(thisEvent.id);
      }
    });
  }

  const filters = generatePollingFilter(
    DateTime.fromMillis(mostRecentEventTime, { zone: 'utc' }).toFormat(
      ISO_DATETIME_NO_TZ_FORMAT
    ),
    inIds,
    neqIds
  );

  return (
    _getEvents({ page_size: 25 }, filters)
      .then((response) => response.data)
      /**
       * There is where we set _initial on the events. In the default state of events the
       * mostRecentEventTime is set to epoch. On the completion of the first successful events
       * update the mostRecentEventTime is updated, meaning it's impossible for subsequent events
       * to be incorrectly marked as _initial. This addresses our reappearing toast issue.
       */
      .then((events) =>
        events.map((e) => ({ ...e, _initial: mostRecentEventTime === epoch }))
      )
      .then((events) => {
        if (events.length > 0) {
          dispatch(addEvents(events));
        }
        return events;
      })
      .catch((e) => [])
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
    events: { events },
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
