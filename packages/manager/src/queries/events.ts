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
  markEventRead,
} from '@linode/api-v4/lib/account';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import React from 'react';
import { INTERVAL } from 'src/constants';

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

const queryKey = 'events';

export const useEventsPolling = (eventHandler?: (event: Event) => void) => {
  const [intervalMultiplier, setIntervalMultiplier] = React.useState(1);

  const resetEventsPolling = () => setIntervalMultiplier(1);

  useQuery<Event[], APIError[]>(
    [queryKey, 'polling'],
    async () => {
      const events = await requestUnreadEvents();
      await markCompletedEventsAsRead(events);
      setIntervalMultiplier(Math.min(intervalMultiplier + 1, 16));
      return events;
    },
    {
      refetchInterval: INTERVAL * intervalMultiplier,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (events) =>
        eventHandler && events.reverse().forEach(eventHandler),
    }
  );

  return { resetEventsPolling };
};

export const useEvents = () => {
  const queryClient = useQueryClient();

  const eventsQueryKey = [queryKey, 'infinite', 'events'];

  const eventsCache = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(eventsQueryKey);

  // Update existing events or invalidate when new events come in
  useEventsPolling((event) => {
    if (eventsCache) {
      const eventLocation = locateEvent(eventsCache, event.id);
      if (eventLocation) {
        eventsCache.pages[eventLocation.pageIdx].data[
          eventLocation.eventIdx
        ] = event;
        queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
          eventsQueryKey,
          eventsCache
        );
      } else {
        queryClient.invalidateQueries(eventsQueryKey);
      }
    }
  });

  return useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    eventsQueryKey,
    ({ pageParam }) => getEvents({ page: pageParam, page_size: 25 }),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );
};

type EventLocation = { pageIdx: number; eventIdx: number };

const locateEvent = (
  eventsCache: InfiniteData<ResourcePage<Event>>,
  eventId: number
): EventLocation | void => {
  for (let pageIdx = 0; pageIdx < eventsCache.pages.length; pageIdx++) {
    const page = eventsCache.pages[pageIdx];
    for (let eventIdx = 0; eventIdx < page.data.length; eventIdx++) {
      if (page.data[eventIdx].id === eventId) {
        return { pageIdx, eventIdx };
      }
    }
  }
};

const requestUnreadEvents = (): Promise<Event[]> =>
  getEvents({ page_size: 25 }, { read: false }).then(
    (response) => response.data
  );

const markCompletedEventsAsRead = async (events: Event[]) => {
  const completedEvents = events
    .filter((event) => !isInProgressEvent(event))

    // We need to keep polling the event for any database that is still creating.
    // The same event will change its status from `notification` to `finished`.
    .filter(
      (event) =>
        !(event.action === 'database_create' && event.status === 'notification')
    );
  await Promise.all(completedEvents.map((event) => markEventRead(event.id)));
};
