import { EVENTS_LIST_FILTER } from 'src/features/Events/constants';

import type { Event, EventAction, Filter } from '@linode/api-v4';

export const isInProgressEvent = (event: Event) => {
  if (event.percent_complete === null) {
    return false;
  }

  return event.percent_complete < 100;
};

export const isEventInProgressDiskImagize = (event: Event): boolean => {
  return (
    event.action === 'disk_imagize' &&
    Boolean(event.secondary_entity) &&
    isInProgressEvent(event)
  );
};

export const isEventImageUpload = (event: Event): boolean => {
  return event.action === 'image_upload';
};

export const isEventRelevantToLinode = (event: Event, linodeId: number) =>
  isPrimaryEntity(event, linodeId) ||
  (isSecondaryEntity(event, linodeId) &&
    isEventRelevantToLinodeAsSecondaryEntity(event));

export const isPrimaryEntity = (event: Event, linodeId: number) =>
  event?.entity?.type === 'linode' && event?.entity?.id === linodeId;

export const isSecondaryEntity = (event: Event, linodeId: number) =>
  event?.secondary_entity?.type === 'linode' &&
  event?.secondary_entity?.id === linodeId;

// Some event types include a Linode as a `secondary_entity`. A subset of these
// events should be included in the `eventsForLinode` selector since they are
// relevant to that Linode.
//
// An example: `clone_linode` events include the source Linode as the `entity`
// and the target Linode as the `secondary_entity`. In this case, we want the
// consumer of the `eventsForLinode` selector to have access to these events so
// it can do things like display progress bars.
export const eventActionsForLinodeAsSecondaryEntity: EventAction[] = [
  'linode_clone',
];
export const isEventRelevantToLinodeAsSecondaryEntity = (event: Event) =>
  eventActionsForLinodeAsSecondaryEntity.includes(event?.action);

/**
 * Because we're using one polling instance (without any API filter) and have many possible event infinite queires
 * with various filters, we must make sure that we filter out API-filtered events when we update our filtered
 * infinite queries.
 *
 * @returns This function return true if the API filter `filter` would match the given `event`. We are basiclly
 * mimicing the API's filtering for the sake of updating our different events infinite queries.
 */
export const doesEventMatchAPIFilter = (event: Event, filter: Filter) => {
  // @ts-expect-error todo fix filter type
  const notEqualItems = filter.action?.['+neq'];
  if (notEqualItems && notEqualItems.includes(event.action)) {
    return false;
  }

  // @ts-expect-error todo improve indexability of filter type
  if (filter?.['entity.id'] && filter['entity.id'] !== event.entity?.id) {
    return false;
  }

  // @ts-expect-error todo improve indexability of filter type
  if (filter?.['entity.type'] && filter['entity.type'] !== event.entity?.type) {
    return false;
  }

  return true;
};

/**
 * Generates a "found in filter" list filter for the API.
 * @example
 *   generateInFilter('id', [1, 22, 333, 4444]);
 *   would produce { '+or': [1, 22, 333, 4444] }
 *   and reads as "where `id` is 1, 22, 333, or 4444."
 */
export const generateInFilter = (keyName: string, arr: (number | string)[]) => {
  return arr.map((el) => ({ [keyName]: el }));
};

export const generateNeqFilter = (
  keyName: string,
  arr: (number | string)[]
) => {
  return arr.map((el) => ({ [keyName]: { '+neq': el } }));
};

/**
 * Generates a filter for API requests;
 * If we have IDs:
 *  "If `created` is greater than the timestamp provided or the `id` is one of ids."
 * or:
 *   "If `created` is greater than the timestamp provided."
 *
 * This filter is invoked on every events request to only get the latest or in-progress events.
 */
export const generatePollingFilter = (
  timestamp: string,
  inIds: number[] = [],
  neqIds: number[] = []
): Filter => {
  let filter: Filter = {
    created: { '+gte': timestamp },
  };

  if (neqIds.length > 0) {
    filter = {
      '+and': [filter, ...generateNeqFilter('id', neqIds)],
    };
  }

  if (inIds.length > 0) {
    filter = {
      '+or': [filter, ...generateInFilter('id', inIds)],
    };
  }

  return {
    ...filter,
    ...EVENTS_LIST_FILTER,
    '+order': 'desc',
    '+order_by': 'id',
  };
};

/**
 * This function exists to...
 * - Solve the "same second problem"
 * - Continue to poll in-progress events
 *
 * ## The "same second problem"
 *
 * It's possible that we may poll for events and a new event might be created after we polled,
 * but at the same second. We must overlap our requests so that we catch any "same second" events.
 * This function returns the ID of events that happened at `latestEventTime` so that we can
 * exclude them (using '+neq') them in our next request.
 *
 *
 * ## Continue to poll in-progress events
 *
 * Given all events that have been fetched since the app loaded,
 * this function returns the IDs of any in progress events so that we
 * continue to poll them for updates.
 *
 * @param events All events that have been fetched since loading the app
 * @param latestEventTime The created timestamp of the most revent event (for example: 2020-01-01T12:00:00)
 */
export const getExistingEventDataForPollingFilterGenerator = (
  events: Event[] | undefined,
  latestEventTime: string
) => {
  if (!events) {
    return {
      eventsThatAlreadyHappenedAtTheFilterTime: [],
      inProgressEvents: [],
    };
  }

  return events.reduce<{
    eventsThatAlreadyHappenedAtTheFilterTime: number[];
    inProgressEvents: number[];
  }>(
    (acc, event) => {
      if (isInProgressEvent(event)) {
        acc.inProgressEvents.push(event.id);
        return acc;
      }
      if (event.created === latestEventTime) {
        acc.eventsThatAlreadyHappenedAtTheFilterTime.push(event.id);
        return acc;
      }
      return acc;
    },
    { eventsThatAlreadyHappenedAtTheFilterTime: [], inProgressEvents: [] }
  );
};
