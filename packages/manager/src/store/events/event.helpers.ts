import {
  Entity,
  Event,
  EventAction,
  EventStatus
} from 'linode-js-sdk/lib/account';
import * as moment from 'moment';
import { compose, equals, findIndex, omit, take, update } from 'ramda';
import { ThunkDispatch } from 'redux-thunk';
import { INTERVAL } from 'src/constants';
import updateRight from 'src/utilities/updateRight';

import { setPollingInterval, setRequestDeadline } from './event.actions';
import { EntityEvent, ExtendedEvent } from './event.types';

/** We use the epoch on our initial request to get all of the users events. */
export const epoch = new Date(`1970-01-01T00:00:00.000`).getTime();

export const resetEventsPolling = (
  dispatch: ThunkDispatch<any, any, any>,
  newInterval: number = 1
) => {
  dispatch(setRequestDeadline(Date.now() + INTERVAL * newInterval));
  dispatch(setPollingInterval(newInterval));
};

/**
 * isRelevantDeletionEvent
 *
 * Returns `true` if the event:
 *   a) has _delete in its action (so it's a deletion event)
 *   b) is not a special case (see below).
 *   c) the event indicates a completed deletion action (its status is finished or notification)
 *
 * If these conditions are met, the entity that the event is attached to
 * is assumed to no longer exist in the database.
 *
 * @param action
 */
export const isRelevantDeletionEvent = (
  action: EventAction,
  status: EventStatus
) => {
  /**
   * These events point to a Linode, not a disk/config/etc.,
   * but the Linode most likely still exists so we shouldn't mark
   * all events related to that Linode as _deleted.
   */
  const ignoredDeletionEvents = ['linode_config_delete', 'disk_delete'];
  if (ignoredDeletionEvents.includes(action)) {
    return false;
  }
  return (
    action.includes(`_delete`) && ['finished', 'notification'].includes(status)
  );
};

/**
 * Safely find an entity in a list of entities returning the index.
 * Will return -1 if the index is not found.
 *
 * entities {Entity[]}
 * entity {null | Entity}
 */
export const findInEvents = (
  events: Pick<ExtendedEvent, 'entity'>[],
  entity: null | Partial<Entity> = {}
) => findIndex(e => equals(e.entity, entity), events);

export const setDeletedEvents = (events: Event[]) => {
  /** Create a list of deletion events. */
  const deletions = events.reduce((result: Event[], event) => {
    const { entity, action, status } = event;
    if (!entity) {
      return result;
    }

    if (!isRelevantDeletionEvent(action, status)) {
      /**
       * This is either a deletion event that hasn't finished
       * (so the entity still exists) or it's something like
       * disk_delete, where the entity itself (the Linode)
       * has not been deleted.
       */
      return result;
    }
    /**
     * If we get all the way down here, we have an event
     * which indicates that an entity has been deleted;
     * add it to the list of deletion events.
     */
    return [event, ...result];
  }, []);

  /** If there are no deletions to process, just return the events. */
  if (deletions.length === 0) {
    return events;
  }

  /** Map events to either deleted or not. */
  return events.map(e => {
    const indexOfFoundEvent = findInEvents(deletions, e.entity);

    return indexOfFoundEvent > -1
      ? { ...e, _deleted: deletions[indexOfFoundEvent].created }
      : e;
  });
};

export const updateEvents = compose(
  /** Finally we return the updated state (right) */
  ([prevEvents, events]) => events,

  /** Nested compose to get around Ramda's shotty typing. */
  compose(
    /** Take only the last 25 events. */
    updateRight<Event[], Event[]>((prevEvents, events) => take(100, events)),

    /** Marked events "_deleted". */
    updateRight<Event[], Event[]>((prevEvents, events) =>
      setDeletedEvents(events)
    ),

    /** Add events to the list. */
    updateRight<Event[], Event[]>((prevEvents, events) =>
      addToEvents(prevEvents, events)
    )
  ),

  /** Convert the arguments to a tuple so we can use updateRight. */
  (prevEvents: Event[], events: Event[]) => [prevEvents, events]
);

/**
 * Compare the latestTime with the given Linode's created time and return the most recent.
 *
 */
export const mostRecentCreated = (
  latestTime: number,
  current: Pick<Event, 'created'>
) => {
  const time: number = moment.utc(current.created).valueOf(); // Unix time (milliseconds)
  return latestTime > time ? latestTime : time;
};

/**
 * Compile an updated list of events by either updating an event in place or prepending an event
 * to prevEvents.
 *
 * I know this could be much more generic, but I cant get the typing right.
 */
export const addToEvents = (prevArr: Event[], arr: Event[]) =>
  arr.reduceRight((updatedArray, el) => {
    /**
     * We need to update in place to maintain the correct timeline of events. Update in-place
     * by finding the index then updating at that index.
     */
    const indexOfFoundEvent = findIndex(({ id }) => id === el.id, updatedArray);
    return indexOfFoundEvent > -1
      ? update(indexOfFoundEvent, el, updatedArray)
      : [el, ...updatedArray];
  }, prevArr);

export const isInProgressEvent = ({
  percent_complete
}: Pick<Event, 'percent_complete'>) =>
  percent_complete !== null && percent_complete < 100;

export const isCompletedEvent = ({
  percent_complete
}: Pick<Event, 'percent_complete'>) =>
  percent_complete !== null && percent_complete === 100;

export const isEntityEvent = (e: Event): e is EntityEvent => Boolean(e.entity);

/**
 * Iterate through new events.
 * If an event is "in-progress" it's added to the inProgressEvents map.
 * If an event is "completed" it is removed from the inProgressEvents map.
 * Otherwise the inProgressEvents is unchanged.
 *
 * @returns { [key: number]: number } inProgressEvents: key value pair, where the
 * key will be the ID of the event and the value will be the percent_complete
 *
 */
export const updateInProgressEvents = (
  inProgressEvents: Record<number, number>,
  event: Pick<Event, 'percent_complete' | 'id'>[]
) => {
  return event.reduce((result, e) => {
    const key = String(e.id);

    if (isCompletedEvent(e)) {
      return omit([key], result);
    }

    return isInProgressEvent(e)
      ? { ...result, [key]: e.percent_complete }
      : result;
  }, inProgressEvents);
};

export const getNumUnseenEvents = (events: Pick<Event, 'seen'>[]) =>
  events.reduce((result, event) => (event.seen ? result : result + 1), 0);
