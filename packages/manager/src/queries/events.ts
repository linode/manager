import { getEvents, markEventSeen } from '@linode/api-v4';
import { DateTime } from 'luxon';
import { useState } from 'react';
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
import { useEventHandlers } from 'src/hooks/useEventHandlers';
import { useToastNotifications } from 'src/hooks/useToastNotifications';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { generatePollingFilter } from 'src/utilities/requestFilters';

import type { APIError, Event, Filter, ResourcePage } from '@linode/api-v4';

export const useEventsInfiniteQuery = (filter?: Filter) => {
  const query = useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    ['events', 'infinite', filter],
    ({ pageParam }) => getEvents({}, { ...filter, id: { '+lt': pageParam } }),
    {
      cacheTime: Infinity,
      getNextPageParam: ({ data, results }) => {
        if (results === data.length) {
          return undefined;
        }
        return data[data.length - 1].id;
      },
      staleTime: Infinity,
    }
  );

  const events = query.data?.pages.reduce(
    (events, page) => [...events, ...page.data],
    []
  );

  return { ...query, events };
};

export const useInProgressEvents = () => {
  return useQuery<Event[], APIError[]>({
    queryKey: ['events', 'poller'],
  });
};

export const useEventsPoller = () => {
  const { incrementPollingInterval, pollingInterval } = usePollingInterval();

  const { handleGlobalToast } = useToastNotifications();
  const { handleEvent } = useEventHandlers();

  const queryClient = useQueryClient();

  const { events } = useEventsInfiniteQuery();

  const [mountTimestamp] = useState<string>(() =>
    DateTime.fromMillis(Date.now(), { zone: 'utc' }).toFormat(
      ISO_DATETIME_NO_TZ_FORMAT
    )
  );

  // If the user has events, poll for new events based on the most recent event's created time.
  // If the user has no events, poll events from the time the app mounted.
  const latestEventTime =
    events && events.length > 0 ? events[0].created : mountTimestamp;

  const {
    eventsThatAlreadyHappenedAtTheFilterTime,
    inProgressEvents,
  } = events?.reduce<{
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
  ) ?? { eventsThatAlreadyHappenedAtTheFilterTime: [], inProgressEvents: [] };

  const hasFetchedInitialEvents = events !== undefined;

  const filter = generatePollingFilter(
    latestEventTime,
    inProgressEvents,
    eventsThatAlreadyHappenedAtTheFilterTime
  );

  useQuery({
    enabled: hasFetchedInitialEvents,
    onSuccess(events) {
      incrementPollingInterval();

      if (events.length > 0) {
        updateEventsQueries(events, queryClient);

        for (const event of events) {
          handleGlobalToast(event);
          handleEvent(event);
        }
      }
    },
    queryFn: () => getEvents({}, filter).then((data) => data.data),
    queryKey: ['events', 'poller', hasFetchedInitialEvents],
    refetchInterval: pollingInterval,
  });

  return null;
};

export const usePollingInterval = () => {
  const queryKey = ['events', 'interval'];
  const queryClient = useQueryClient();
  const { data: intervalMultiplier = 1 } = useQuery(queryKey, () =>
    queryClient.getQueryData<number>(queryKey)
  );
  return {
    incrementPollingInterval: () =>
      queryClient.setQueryData<number>(
        queryKey,
        Math.min(intervalMultiplier + 1, 16)
      ),
    pollingInterval: DISABLE_EVENT_THROTTLE
      ? 500
      : intervalMultiplier * INTERVAL,
    resetEventsPolling: () => queryClient.setQueryData<number>(queryKey, 1),
  };
};

export const useMarkEventsAsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number>(
    (eventId) => markEventSeen(eventId),
    {
      onSuccess: (_, eventId) => {
        queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
          ['events', 'infinite', undefined],
          (prev) => {
            if (!prev) {
              return {
                pageParams: [],
                pages: [],
              };
            }

            let foundLatestSeenEvent = false;

            for (const page of prev.pages) {
              for (const event of page.data) {
                if (event.id === eventId) {
                  foundLatestSeenEvent = true;
                }
                if (foundLatestSeenEvent) {
                  event.seen = true;
                }
              }
            }

            return {
              pageParams: prev?.pageParams ?? [],
              pages: prev?.pages ?? [],
            };
          }
        );
      },
    }
  );
};

export const updateEventsQueries = (
  events: Event[],
  queryClient: QueryClient
) => {
  queryClient
    .getQueryCache()
    .findAll(['events', 'infinite'])
    .forEach(({ queryKey }) => {
      const apiFilter = queryKey[queryKey.length - 1] as Filter | undefined;

      if (apiFilter === undefined) {
        updateEventsQuery(events, queryKey, queryClient);
        return;
      }

      const filteredEvents = events.filter((event) => {
        // @ts-expect-error todo fix filter type
        const notEqualItems = apiFilter.action?.['+neq'];
        if (notEqualItems && notEqualItems.includes(event.action)) {
          return false;
        }
        if (
          apiFilter?.['entity.id'] &&
          apiFilter?.['entity.type'] &&
          apiFilter['entity.id'] !== event.entity?.id &&
          apiFilter['entity.type'] !== event.entity?.type
        ) {
          return false;
        }
        return true;
      });

      updateEventsQuery(filteredEvents, queryKey, queryClient);
    });
};

export const updateEventsQuery = (
  events: Event[],
  queryKey: QueryKey,
  queryClient: QueryClient
) => {
  queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
    queryKey,
    (prev) => {
      if (!prev) {
        return {
          pageParams: [],
          pages: [],
        };
      }

      const updatedEventIndexes: number[] = [];

      for (const page of prev.pages) {
        for (let i = 0; i < events.length; i++) {
          const indexOfEvent = page.data.findIndex(
            (e) => e.id === events[i].id
          );

          if (indexOfEvent !== -1) {
            page.data[indexOfEvent] = events[i];
            updatedEventIndexes.push(i);
          }
        }
      }

      const newEvents: Event[] = [];

      for (let i = 0; i < events.length; i++) {
        if (!updatedEventIndexes.includes(i)) {
          newEvents.push(events[i]);
        }
      }

      if (newEvents.length > 0) {
        // For all events, that remain, append them to the top of the events list
        prev.pages[0].data = [...newEvents, ...prev.pages[0].data];
      }

      return {
        pageParams: prev.pageParams,
        pages: prev.pages,
      };
    }
  );
};
