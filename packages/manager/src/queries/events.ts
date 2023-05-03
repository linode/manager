import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
  InfiniteData,
} from 'react-query';
import {
  Entity,
  Event,
  getEvents,
  markEventSeen,
} from '@linode/api-v4/lib/account';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

export interface ExtendedEvent extends Event {
  _deleted?: string;
  _initial?: boolean;
}

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

const queryKey = 'events';

export const useEventsPolling = (
  eventHandler?: (event: ExtendedEvent) => void
) => {
  useQuery<ExtendedEvent[], APIError[]>(
    [queryKey, 'polling'],
    async () => {
      const events = await requestUnseenEvents();
      await markCompletedEventsAsSeen(events);
      return events;
    },
    {
      refetchInterval: 5000,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (events) =>
        eventHandler && events.reverse().forEach(eventHandler),
    }
  );
};

export const useEvents = () => {
  const queryClient = useQueryClient();

  const eventsQueryKey = [queryKey, 'infinite', 'events'];
  const eventsPageZeroKey = [queryKey, 'infinite', 'zero'];
  const eventsLookupKey = [queryKey, 'infinite', 'lookup'];

  const eventsCache = queryClient.getQueryData<InfiniteData<number[]>>(
    eventsQueryKey
  );

  const pageZero =
    queryClient.getQueryData<number[]>(eventsPageZeroKey) ??
    queryClient.setQueryData<number[]>(eventsPageZeroKey, []);

  // Maintain a look-up table for efficiently updating events
  const eventsLookup =
    queryClient.getQueryData<Map<number, ExtendedEvent>>(eventsLookupKey) ??
    queryClient.setQueryData<Map<number, ExtendedEvent>>(
      eventsLookupKey,
      new Map()
    );

  // Update the cache with new/updated events
  useEventsPolling((event) => {
    if (eventsCache) {
      if (!eventsLookup.has(event.id)) {
        pageZero.unshift(event.id);
      }
      eventsLookup.set(event.id, event);
    }
  });

  const mostRecentEventId = eventsCache?.pages?.[0][0];
  const mostRecentEvent = mostRecentEventId
    ? eventsLookup.get(mostRecentEventId)
    : undefined;

  const eventsData = useInfiniteQuery<ResourcePage<number>, APIError[]>(
    eventsQueryKey,
    async ({ pageParam }) => {
      const eventsPage = await getEvents(
        { page: pageParam, page_size: 25 },
        mostRecentEvent ? { created: { '+lte': mostRecentEvent?.created } } : {} // ignore new events since these will change cached pages
      );

      // update the lookup table
      eventsPage.data.forEach((event) => eventsLookup?.set(event.id, event));

      return { ...eventsPage, data: eventsPage.data.map((event) => event.id) };
    },
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );
  return {
    ...eventsData,
    data: [pageZero, ...(eventsData.data?.pages.map((page) => page.data) ?? [])]
      .map((page) =>
        page
          .map((eventId) => eventsLookup.get(eventId))
          .filter(isNotNullOrUndefined)
      )
      .reduce((page, events) => [...page, ...events], []),
  };
};

const requestUnseenEvents = (): Promise<ExtendedEvent[]> =>
  getEvents({ page_size: 25 }, { seen: false }).then(
    (response) => response.data
  );

const markCompletedEventsAsSeen = async (events: ExtendedEvent[]) => {
  const completedEvents = events
    .filter((event) => !isInProgressEvent(event))

    // We need to keep polling the event for any database that is still creating.
    // The same event will change its status from `notification` to `finished`.
    .filter(
      (event) =>
        !(event.action === 'database_create' && event.status === 'notification')
    );
  await Promise.all(completedEvents.map((event) => markEventSeen(event.id)));
};
