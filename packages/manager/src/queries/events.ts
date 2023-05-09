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
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { INTERVAL, ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { isInProgressEvent } from 'src/store/events/event.helpers';

const queryKey = 'events';
const eventsQueryKey = [queryKey, 'infinite'];

export const useEventsPolling = (options: {
  eventHandler?: (event: Event) => void;
  filter?: Filter;
}) => {
  const { eventHandler, filter } = options;

  const [intervalMultiplier, setIntervalMultiplier] = React.useState(1);
  const [mountTime] = React.useState(Date.now);

  useQuery<Event[], APIError[]>(
    [queryKey, 'polling', filter],
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
      refetchInterval: INTERVAL * intervalMultiplier,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (events) =>
        eventHandler && events.reverse().forEach(eventHandler),
    }
  );

  return { resetEventsPolling: () => setIntervalMultiplier(1) };
};

export const useEventsInfiniteQuery = (filter?: Filter) => {
  const queryClient = useQueryClient();

  const queryKey = [...eventsQueryKey, filter];

  const eventsCache = queryClient.getQueryData<
    InfiniteData<ResourcePage<Event>>
  >(queryKey);

  // Update existing events or invalidate when new events come in
  useEventsPolling({
    eventHandler: (event) => {
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
          queryClient.invalidateQueries(queryKey);
        }
      }
    },
    filter,
  });

  return useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    queryKey,
    ({ pageParam }) => getEvents({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );
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

const updateSeenEvents = (latestId: number, queryClient: QueryClient) => {
  for (const [queryKey, data] of queryClient.getQueriesData<
    InfiniteData<ResourcePage<Event>>
  >(eventsQueryKey)) {
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
