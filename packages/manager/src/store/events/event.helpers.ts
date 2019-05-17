import * as moment from 'moment';
import { compose, equals, findIndex, omit, take, update } from 'ramda';
import updateRight from 'src/utilities/updateRight';

export interface ExtendedEvent extends Linode.Event {
  _deleted?: string;
  _initial?: boolean;
}

type Event = ExtendedEvent;

/** We use the epoch on our initial request to get all of the users events. */
export const epoch = new Date(`1970-01-01T00:00:00.000`).getTime();

/**
 * Safely find an entity in a list of entities returning the index.
 * Will return -1 if the index is not found.
 *
 * entities {Linode.Entity[]}
 * entity {null | Linode.Entity}
 */
export const findInEvents = (
  events: Pick<Event, 'entity'>[],
  entity: null | Partial<Linode.Entity> = {}
) => findIndex(e => equals(e.entity, entity), events);

export const setDeletedEvents = (events: Event[]) => {
  /** Create a list of deletion events. */
  const deletions = events.reduce((result: Event[], event) => {
    const { entity, action, status } = event;

    if (!entity) {
      return result;
    }

    if (
      !action.includes(`_delete`) ||
      !['finished', 'notification'].includes(status)
    ) {
      return result;
    }

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

export const isEntityEvent = (e: Linode.Event): e is Linode.EntityEvent =>
  Boolean(e.entity);

/**
 * Iterate through new events.
 * If an event is "in-progress" it's added to the inProgressEvents map.
 * If an event is "completed" it is removed from the inProgressEvents map.
 * Otherwise the inProgressEvents is unchanged.
 *
 * @retuns { [key: number]: number } inProgressEvents: key value pair, where the
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
