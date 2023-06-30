import {
  Event,
  getEvents,
  markEventRead,
  markEventSeen,
} from '@linode/api-v4/lib/account';
import { APIError, Filter, ResourcePage } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import React from 'react';
import {
  InfiniteData,
  QueryClient,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {
  DISABLE_EVENT_THROTTLE,
  INTERVAL,
  ISO_DATETIME_NO_TZ_FORMAT,
} from 'src/constants';
import { isInProgressEvent } from 'src/utilities/eventUtils';
import { generateInFilter } from 'src/utilities/requestFilters';

const queryKey = 'events';
const eventsPollingQueryKey = (filter?: Filter) => [
  queryKey,
  'polling',
  filter,
];
const infiniteEventsQueryKey = (filter: Filter | undefined = {}) => [
  queryKey,
  'infinite',
  ...(filter ? [filter] : []),
];
const pageZeroQueryKey = (infiniteEventsQueryKey: QueryKey) => [
  queryKey,
  'pageZero',
  infiniteEventsQueryKey,
];

export interface EventsQueryOptions {
  enabled?: boolean;
  eventHandler?: (event: Event) => void;
  filter?: Filter;
}

export const useEventsInfiniteQuery = (options: EventsQueryOptions = {}) => {
  const { enabled = true, eventHandler, filter } = options;

  const queryClient = useQueryClient();
  const queryKey = infiniteEventsQueryKey(filter);

  const eventsCache = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(queryKey);

  const incompleteEvents = React.useMemo(
    () =>
      eventsCache?.pages
        .reduce((events, page) => [...events, ...page.data], [])
        .filter(incompleteEvent),
    [eventsCache]
  );

  const pollingEventHandler = (event: Event) => {
    updateEventsCache(queryClient, queryKey, event);
    if (eventHandler) {
      eventHandler(event);
    }
  };

  // Poll for new events
  const { resetEventsPolling: resetNewEventsPolling } = useEventsPolling({
    enabled,
    eventHandler: pollingEventHandler,
    filter,
  });

  // Poll in-progress events for updates
  const { resetEventsPolling: resetInProgressEventsPolling } = useEventsPolling(
    {
      enabled: enabled && incompleteEvents && incompleteEvents.length > 0,
      eventHandler: pollingEventHandler,
      filter: {
        created: undefined,
        '+or': [
          ...generateInFilter(
            'id',
            incompleteEvents?.map((event) => event.id) ?? []
          ),
        ],
      },
    }
  );

  // Pages start from the first fetched event, so new
  // events don't offset subsequent pages
  const firstEventCreated = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(queryKey)?.pages[0]?.data[0]?.created;

  const queryResult = useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    queryKey,
    ({ pageParam }) =>
      getEvents(
        { page: pageParam, page_size: 25 },
        {
          created: { '+lte': firstEventCreated },
          ...filter,
        }
      ),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );

  // Prepend page zero
  const pageZeroEvents = queryClient.getQueryData<Event[]>(
    pageZeroQueryKey(queryKey)
  );

  const pageZero = pageZeroEvents
    ? {
        data: pageZeroEvents,
        page: 0,
        pages: queryResult.data?.pages.length ?? 0,
        results: pageZeroEvents?.length,
      }
    : undefined;

  const data = {
    pages: [
      ...(pageZero ? [pageZero] : []),
      ...(queryResult.data?.pages ?? []),
    ],
    pageParams: [
      ...(pageZeroEvents ? [0] : []),
      ...(queryResult.data?.pageParams ?? []),
    ],
  };

  return {
    ...queryResult,
    data,
    events: data.pages.reduce((events, page) => [...events, ...page.data], []),
    resetEventsPolling: () => {
      resetNewEventsPolling();
      resetInProgressEventsPolling();
    },
  };
};

export const useMarkEventsAsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number>(
    (eventId) => markEventSeen(eventId),
    {
      onSuccess: (_, eventId) => updateSeenEvents(eventId, queryClient),
    }
  );
};

const useEventsPolling = (options: EventsQueryOptions = {}) => {
  const { enabled = true, eventHandler, filter } = options;

  const [intervalMultiplier, setIntervalMultiplier] = React.useState(1);
  const [mountTime] = React.useState(Date.now);

  useQuery<Event[], APIError[]>(
    eventsPollingQueryKey(filter),
    async () => {
      const events = await getEvents(
        { page_size: 25 },
        {
          read: false,
          created: {
            '+gte': DateTime.fromMillis(mountTime, { zone: 'utc' }).toFormat(
              ISO_DATETIME_NO_TZ_FORMAT
            ),
          },
          ...filter,
        }
      ).then((response) => response.data);
      await markCompletedEventsAsRead(events);
      setIntervalMultiplier(Math.min(intervalMultiplier + 1, 16));
      return events;
    },
    {
      enabled,
      refetchInterval: DISABLE_EVENT_THROTTLE
        ? 500
        : INTERVAL * intervalMultiplier,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (events) =>
        eventHandler && events.reverse().forEach(eventHandler),
    }
  );

  return { resetEventsPolling: () => setIntervalMultiplier(1) };
};

const updateEventsCache = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  event: Event
) => {
  const eventsCache = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(queryKey);

  if (eventsCache) {
    const eventLocation = locateEvent(eventsCache, event.id);
    if (eventLocation) {
      eventsCache.pages[eventLocation.pageIdx].data[
        eventLocation.eventIdx
      ] = event;
      queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
        queryKey,
        eventsCache
      );
    } else {
      addEventToPageZero(queryClient, pageZeroQueryKey(queryKey), event);
    }
  }
};

// Add new events to a 'page zero' so we don't
// offset the sequence of events in subsequently
// fetched pages
const addEventToPageZero = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  event: Event
) => {
  const pageZero = queryClient.getQueryData<Event[]>(queryKey) ?? [];
  const eventIdx = pageZero.findIndex((thisEvent) => thisEvent.id == event.id);
  if (eventIdx >= 0) {
    pageZero[eventIdx] = event;
  } else {
    pageZero.unshift(event);
  }
  queryClient.setQueryData<Event[]>(queryKey, pageZero);
};

type EventLocation = { pageIdx: number; eventIdx: number };

const locateEvent = (
  eventsCache: InfiniteData<ResourcePage<Event>>,
  eventId: number
): EventLocation | undefined => {
  for (let pageIdx = 0; pageIdx < eventsCache.pages.length; pageIdx++) {
    const page = eventsCache.pages[pageIdx];
    for (let eventIdx = 0; eventIdx < page.data.length; eventIdx++) {
      if (page.data[eventIdx].id === eventId) {
        return { pageIdx, eventIdx };
      }
    }
  }
  return undefined;
};

const incompleteEvent = (event: Event) =>
  isInProgressEvent(event) ||
  // We need to keep polling the event for any database that is still creating.
  // The same event will change its status from `notification` to `finished`.
  (event.action === 'database_create' && event.status === 'notification');

const markCompletedEventsAsRead = async (events: Event[]) => {
  const completedEvents = events.filter((event) => !incompleteEvent(event));
  await Promise.all(completedEvents.map((event) => markEventRead(event.id)));
};

const updateSeenEvents = (latestId: number, queryClient: QueryClient) => {
  for (const [queryKey, data] of queryClient.getQueriesData<
    InfiniteData<ResourcePage<Event>>
  >(infiniteEventsQueryKey(undefined))) {
    let foundLatestSeenEvent = false;
    const updatedData = {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        data: page.data.map((event) =>
          foundLatestSeenEvent || event.id === latestId
            ? ((foundLatestSeenEvent = true), { ...event, seen: true })
            : event
        ),
      })),
    };

    queryClient.setQueriesData<InfiniteData<ResourcePage<Event>>>(
      queryKey,
      updatedData
    );
  }
};
