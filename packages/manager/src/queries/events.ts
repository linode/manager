import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { Entity, Event, getEvents } from '@linode/api-v4/lib/account';
import { useEffect } from 'react';
import { generatePollingFilter } from 'src/utilities/requestFilters';
import { DateTime } from 'luxon';
import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import {
  isCompletedEvent,
  isInProgressEvent,
  isLongPendingEvent,
  mostRecentCreated,
  updateEvents,
} from 'src/store/events/event.helpers';
import { parseAPIDate } from 'src/utilities/date';
import { events } from 'src/__data__/events';

export interface EventsState {
  events: ExtendedEvent[];
  mostRecentEventTime: number | undefined;
  unseenEventsCount: number;

  /**
   * Map from Event ID to percentage complete.
   */
  inProgressEvents: Map<number, number>;
}

export interface ExtendedEvent extends Event {
  _deleted?: string;
  _initial?: boolean;
}

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

export const queryKey = 'events';

export type EventHandler = (event: ExtendedEvent) => void;

const dispatchEvents = (
  events: ExtendedEvent[],
  eventHandlers: Set<EventHandler>
) => {
  events.forEach((event) =>
    Array.from(eventHandlers.values()).forEach((handler) => handler(event))
  );
};

const eventsCacheKey = [queryKey, 'cache'];
export const useEventsPolling = (
  eventHandler?: (event: ExtendedEvent) => void
) => {
  const queryClient = useQueryClient();

  const eventHandlers = getEventHandlers(queryClient);
  useEffect(
    () =>
      eventHandler &&
      (eventHandlers.add(eventHandler),
      () => {
        eventHandlers.delete(eventHandler);
      }),
    [eventHandler, eventHandlers]
  );

  return useQuery<EventsState, APIError[]>(
    eventsCacheKey,
    async () => {
      const eventsStateCache = queryClient.getQueryData<EventsState>(queryKey);
      const { eventsState, newEvents } = await requestEvents(eventsStateCache);
      dispatchEvents(newEvents, eventHandlers);
      return eventsState;
    },
    {
      refetchInterval: 5000,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
};

const eventHandlersKey = [queryKey, 'handlers'];
const getEventHandlers = (queryClient: QueryClient) =>
  queryClient.getQueryData<Set<EventHandler>>(eventHandlersKey) ??
  queryClient.setQueryData<Set<EventHandler>>(eventHandlersKey, new Set());

/**
 * Will send a filtered request for events which have been created on or after the most recent existing
 * event or the epoch if there are no stored events. Exclude events already in memory with a "+neq" filter.
 */
const requestEvents = (
  eventsStateCache: EventsState | undefined
): Promise<{
  eventsState: EventsState;
  newEvents: ExtendedEvent[];
}> =>
  getEvents(
    { page_size: 25 },
    eventsStateCache && createEventsFilter(eventsStateCache)
  )
    .then((response) => response.data)
    /**
     * There is where we set _initial on the events. In the default state of events the
     * mostRecentEventTime is set to epoch. On the completion of the first successful events
     * update the mostRecentEventTime is updated, meaning it's impossible for subsequent events
     * to be incorrectly marked as _initial. This addresses our reappearing toast issue.
     */
    .then((events) =>
      events.map((e) => ({ ...e, _initial: eventsStateCache === undefined }))
    )
    .then((events) => ({
      eventsState: updateEventsState(eventsStateCache, events),
      newEvents: events,
    }));

const createEventsFilter = (eventsStateCache: EventsState) => {
  const {
    mostRecentEventTime,
    inProgressEvents,
    events: _events,
  } = eventsStateCache;

  // Regardless of date created, we request events that are still in-progress.
  const inIds = Object.keys(inProgressEvents).map((thisId) => +thisId);

  // We need to keep polling the event for any database that is still creating.
  // The same event will change its status from `notification` to `finished`.
  const databaseEventIds = _events
    .filter(
      (event) =>
        event.action === 'database_create' && event.status === 'notification'
    )
    .map((event) => event.id);

  const includeIds = [...inIds, ...databaseEventIds];

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
        !isInProgressEvent(thisEvent) &&
        !isLongPendingEvent(thisEvent)
      ) {
        neqIds.push(thisEvent.id);
      }
    });
  }

  return generatePollingFilter(
    DateTime.fromMillis(mostRecentEventTime ?? 0, { zone: 'utc' }).toFormat(
      ISO_DATETIME_NO_TZ_FORMAT
    ),
    includeIds,
    neqIds
  );
};

const updateEventsState = (
  eventsStateCache: EventsState | undefined,
  newEvents: ExtendedEvent[]
): EventsState => {
  const updatedEvents = updateEvents(eventsStateCache?.events ?? [], newEvents);
  return {
    events: updatedEvents,
    mostRecentEventTime: events.reduce(
      mostRecentCreated,
      eventsStateCache?.mostRecentEventTime
    ),
    unseenEventsCount: getNumUnseenEvents(updatedEvents),
    inProgressEvents: updateInProgressEvents(
      eventsStateCache?.inProgressEvents ?? new Map(),
      events
    ),
  };
};

/**
 * Iterate through new events.
 * If an event is "in-progress" it's added to the inProgressEvents map.
 * If an event is "completed" it is removed from the inProgressEvents map.
 * Otherwise the inProgressEvents is unchanged.
 */
export const updateInProgressEvents = (
  inProgressEvents: Map<number, number>,
  events: Event[]
) => {
  return events.reduce((acc, e) => {
    if (isCompletedEvent(e)) {
      const updatedMap = new Map(acc);
      updatedMap.delete(e.id);
      return updatedMap;
    }

    return isInProgressEvent(e)
      ? new Map(acc).set(e.id, e.percent_complete)
      : acc;
  }, inProgressEvents);
};

export const getNumUnseenEvents = (events: Pick<Event, 'seen'>[]) =>
  events.reduce((result, event) => (event.seen ? result : result + 1), 0);
