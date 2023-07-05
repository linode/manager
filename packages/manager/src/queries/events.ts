import { Event, getEvents, markEventSeen } from '@linode/api-v4/lib/account';
import { APIError, Filter, ResourcePage } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
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
import { parseAPIDate } from 'src/utilities/date';
import {
  isInProgressEvent,
  isLongPendingEvent,
  mostRecentCreated,
} from 'src/utilities/eventUtils';
import { generatePollingFilter } from 'src/utilities/requestFilters';

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

  const [mountTimestamp] = useState<string>(() =>
    DateTime.fromMillis(Date.now(), { zone: 'utc' }).toFormat(
      ISO_DATETIME_NO_TZ_FORMAT
    )
  );

  const incompleteEvents = queryClient
    .getQueryData<InfiniteData<ResourcePage<Event>>>(queryKey)
    ?.pages.reduce((events, page) => [...events, ...page.data], [])
    .filter(incompleteEvent);

  const pollingEventHandler = React.useCallback(
    (event: Event) => {
      updateEventsCache(queryClient, queryKey, event);
      if (eventHandler) {
        eventHandler(event);
      }
    },
    [eventHandler, queryClient, queryKey]
  );

  // Poll for new events and updates to in-progress events
  const { resetEventsPolling } = useEventsPolling(
    incompleteEvents ?? [],
    enabled,
    pollingEventHandler,
    filter
  );

  const queryResult = useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    queryKey,
    ({ pageParam }) =>
      getEvents(
        { page: pageParam ?? 0, page_size: 25 },
        {
          created: { '+lte': mountTimestamp }, // Exclude new events as these will offset the page ordering
          ...filter,
        }
      ),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );

  // Prepend page zero
  const { data: pageZeroEvents } = useQuery<Event[]>(
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

  const results = {
    pages: [
      ...(pageZero ? [pageZero] : []),
      ...(queryResult.data?.pages ?? []),
    ],
    pageParams: [
      ...(pageZeroEvents ? [0] : []),
      ...(queryResult.data?.pageParams ?? []),
    ],
  };

  const events = results.pages.reduce(
    (events, page) => [...events, ...page.data],
    []
  );

  return {
    ...queryResult,
    results,
    events,
    resetEventsPolling,
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

const useEventsPolling = (
  inProgressEvents: Event[],
  enabled: boolean,
  eventHandler: (event: Event) => void,
  customFilter: Filter = {}
) => {
  const [intervalMultiplier, setIntervalMultiplier] = React.useState(1);

  // This solves the 'split-second' problem:
  // We overlap the filter by 1 second to avoid missing events that occurred just after we polled (during the same second).
  // We keep track of the latest completed events and specifically filter them out to avoid duplication.
  const [latestEventTime, setLatestEventTime] = React.useState(Date.now);
  const [ignoreEvents, setIgnoreEvents] = React.useState<Event[]>();

  useQuery<Event[], APIError[]>(
    eventsPollingQueryKey(customFilter),
    () =>
      getEvents(
        undefined,
        generatePollingFilter(
          DateTime.fromMillis(latestEventTime, { zone: 'utc' }).toFormat(
            ISO_DATETIME_NO_TZ_FORMAT
          ),
          inProgressEvents.map((event) => event.id),
          ignoreEvents?.map((event) => event.id)
        )
      ).then((response) => response.data),
    {
      enabled,
      refetchInterval: DISABLE_EVENT_THROTTLE
        ? 500
        : INTERVAL * intervalMultiplier,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (events) => {
        setIntervalMultiplier(Math.min(intervalMultiplier + 1, 16));
        const newLatestEventTime = events.reduce(
          mostRecentCreated,
          latestEventTime
        );

        setLatestEventTime(newLatestEventTime);
        setIgnoreEvents(
          [...(ignoreEvents ?? []), ...events].filter(
            (event) =>
              parseAPIDate(event.created).valueOf() === newLatestEventTime &&
              !isInProgressEvent(event) &&
              !isLongPendingEvent(event)
          )
        );

        events.reverse().forEach(eventHandler);
      },
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

  if (eventsCache?.pages.length) {
    const eventLocation = locateEvent(eventsCache, event.id);
    if (eventLocation) {
      eventsCache.pages[eventLocation.pageIdx].data[
        eventLocation.eventIdx
      ] = event;
    } else {
      eventsCache.pages[0].data.unshift(event);
      eventsCache.pages[0].results++;
    }

    queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
      queryKey,
      eventsCache
    );
  }
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

const updateSeenEvents = (latestId: number, queryClient: QueryClient) => {
  for (const [queryKey, data] of queryClient.getQueriesData<
    InfiniteData<ResourcePage<Event>>
  >(infiniteEventsQueryKey(undefined))) {
    let foundLatestSeenEvent = false;

    data.pages.forEach((page) =>
      page.data.forEach((event) => {
        if (event.id === latestId) {
          foundLatestSeenEvent = true;
        }
        if (foundLatestSeenEvent) {
          event.seen = true;
        }
      })
    );

    queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(queryKey, data);
  }
};
