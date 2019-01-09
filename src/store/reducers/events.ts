import * as moment from 'moment';
import { compose, equals, findIndex, omit, take, update } from 'ramda';
import { AnyAction } from "redux";
import { ThunkAction } from "redux-thunk";
import { getEvents as _getEvents, markEventSeen } from 'src/services/account/events';
import { dateFormat } from 'src/time';
import { generatePollingFilter } from 'src/utilities/requestFilters';
import updateRight from 'src/utilities/updateRight';
import actionCreatorFactory, { isType } from 'typescript-fsa';

type Event = ExtendedEvent;

/** State */
type State = ApplicationState['events'];

/** We use the epoch on our initial request to get all of the users events. */
export const epoch = new Date(`1970-01-01T00:00:00.000`).getTime();

export const defaultState: State = {
  events: [],
  mostRecentEventTime: epoch,
  countUnseenEvents: 0,
  inProgressEvents: {},
};



/** Actions */
const ADD_EVENTS = `ADD_EVENTS`;

const UPDATE_EVENTS_AS_SEEN = `UPDATE_EVENTS_AS_SEEN`;

const actionCreator = actionCreatorFactory(`@@manager/events`);

export const addEvents = actionCreator<Event[]>(ADD_EVENTS);

export const updateEventsAsSeen = actionCreator(UPDATE_EVENTS_AS_SEEN);

export const actions = { addEvents, updateEventsAsSeen };



/** Reducer */
export default (state = defaultState, action: AnyAction) => {

  if (isType(action, addEvents)) {
    const { payload: events } = action;
    const {
      events: prevEvents,
      inProgressEvents: prevInProgressEvents,
      mostRecentEventTime,
    } = state;
    const updatedEvents = updateEvents(prevEvents, events);

    return {
      ...state,
      events: updatedEvents,
      mostRecentEventTime: events.reduce(mostRecentCreated, mostRecentEventTime),
      countUnseenEvents: getNumUnseenEvents(updatedEvents),
      inProgressEvents: updateInProgressEvents(prevInProgressEvents, events),
    };
  }

  if (isType(action, updateEventsAsSeen)) {
    return {
      ...state,
      events: state.events.map((event) => ({ ...event, seen: true })),
      countUnseenEvents: 0,
    }
  }

  return state;
};



/** Helpers */
/**
 * Safely find an entity in a list of entities returning the index.
 * Will return -1 if the index is not found.
 *
 * entities {Linode.Entity[]}
 * entity {null | Linode.Entity}
 */
export const findInEvents = (events: Pick<Event, 'entity'>[], entity: null | Partial<Linode.Entity> = {}) =>
  findIndex((e) => equals(e.entity, entity), events);

export const setDeletedEvents = (events: Event[]) => {
  /** Create a list of deletion events. */
  const deletions = events
    .reduce((result: Linode.Event[], event) => {
      const { entity, action, status } = event;

      if (!entity) {
        return result;
      }

      if (!action.includes(`_delete`) || !['finished', 'notification'].includes(status)) {
        return result;
      }

      return [event, ...result];
    }, []);

  /** If there are no deletions to process, just return the events. */
  if (deletions.length === 0) {
    return events;
  }

  /** Map events to either deleted or not. */
  return events.map((e) => {
    const indexOfFoundEvent = findInEvents(deletions, e.entity);

    return indexOfFoundEvent > -1
      ? ({ ...e, _deleted: deletions[indexOfFoundEvent].created })
      : e
  }
  );
};

export const updateEvents = compose(
  /** Finally we return the updated state (right) */
  ([prevEvents, events]) => events,

  /** Nested compose to get around Ramda's shotty typing. */
  compose(
    /** Take only the last 25 events. */
    updateRight<Event[], Event[]>((prevEvents, events) => take(100, events)),

    /** Marked events "_deleted". */
    updateRight<Event[], Event[]>((prevEvents, events) => setDeletedEvents(events)),

    /** Add events to the list. */
    updateRight<Event[], Event[]>((prevEvents, events) => addToEvents(prevEvents, events)),
  ),

  /** Convert the arguments to a tuple so we can use updateRight. */
  (prevEvents: Event[], events: Event[]) => [prevEvents, events],
);

/**
 * Compare the latestTime with the given Linode's created time and return the most recent.
 *
 */
export const mostRecentCreated = (latestTime: number, current: Pick<Event, 'created'>) => {
  const time: number = moment.utc(current.created).valueOf(); // Unix time (milliseconds)
  return latestTime > time ? latestTime : time;
};

/**
 * Compile an updated list of events by either updating an event in place or prepending an event
 * to prevEvents.
 *
 * I know this could be much more generic, but I cant get the typing right.
 */
export const addToEvents = (prevArr: Event[], arr: Event[]) => arr
  .reduceRight((updatedArray, el) => {
    /**
     * We need to update in place to maintain the correct timeline of events. Update in-place
     * by finding the index then updating at that index.
     */
    const indexOfFoundEvent = findIndex(({ id }) => id === el.id, updatedArray);
    return indexOfFoundEvent > -1
      ? update(indexOfFoundEvent, el, updatedArray)
      : [el, ...updatedArray];
  }, prevArr)

export const isInProgressEvent = ({ percent_complete }: Pick<Event, 'percent_complete'>) => percent_complete !== null && percent_complete < 100;

export const isCompletedEvent = ({ percent_complete }: Pick<Event, 'percent_complete'>) => percent_complete !== null && percent_complete === 100;

export const isEntityEvent = (e: Linode.Event): e is Linode.EntityEvent => Boolean(e.entity);

/**
 * Iterate through new events.
 * If an event is "in-progress" it's added to the inProgressEvents map.
 * If an event is "completed" it is removed from the inProgressEvents map.
 * Otherwise the inProgressEvents is unchanged.
 *
 */
export const updateInProgressEvents = (
  inProgressEvents: Record<number, boolean>,
  event: Pick<Event, 'percent_complete' | 'id'>[],
) => {
  return event.reduce((result, e) => {
    const key = String(e.id);

    if (isCompletedEvent(e)) {
      return omit([key], result);
    }

    return isInProgressEvent(e) ? { ...result, [key]: true } : result
  }, inProgressEvents);
}

export const getNumUnseenEvents = (events: Pick<Event, 'seen'>[]) =>
  events.reduce((result, event) => event.seen ? result : result + 1, 0);



/** Async */
/**
 * Will send a filtered request for events which have been created after the most recent existing
 * event or the epoch if there are no stored events.
 */
const getEvents: () => ThunkAction<Promise<Event[]>, ApplicationState, undefined>
  = () => (dispatch, getState) => {
    const { mostRecentEventTime, inProgressEvents } = getState().events;

    const filters = generatePollingFilter(
      moment.utc(mostRecentEventTime).format(dateFormat),
      Object.keys(inProgressEvents),
    );

    return _getEvents({ page_size: 25 }, filters)
      .then(response => response.data.data)
      /**
       * There is where we set _initial on the events. In the default state of events the
       * mostRecentEventTime is set to epoch. On the completion of the first successful events
       * update the mostRecentEventTime is updated, meaning it's impossible for subsequent events
       * to be incorrectly marked as _initial. This addresses our reappearing toast issue.
       */
      .then(events => events.map(e => ({ ...e, _initial: mostRecentEventTime === epoch })))
      .then((events) => {
        if (events.length > 0) {
          dispatch(addEvents(events));
        }
        return events;
      })
  };

/**
 * Send a request to mark all currently stored events as seen, then call updateEventsAsSeen
 * which iterates the evnts and marks them seen.
 */
const markAllSeen: () => ThunkAction<Promise<any>, ApplicationState, undefined>
  = () => (dispatch, getState) => {
    const { events: { events } } = getState();
    /** */
    const latestId = events.reduce((result, { id }) => id > result ? id : result, 0);

    return markEventSeen(latestId)
      .then(() => dispatch(updateEventsAsSeen()))
      .catch(() => null)
  };

export const async = { getEvents, markAllSeen };
