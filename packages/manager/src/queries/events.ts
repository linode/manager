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

/**
 * Gets an infinitly scrollable list of all Events
 *
 * This query is kept up to date by `useEventsPoller`.
 *
 * @param filter an optional filter can be passed to filter out events. If you use a filter,
 * you must make sure `doesEventMatchAPIFilter` implements the same filtering so the cache is updated correctly.
 *
 * The magic here is that we're doing cursor based pagination using the event `id`.
 * We are doing this as opposed to page based pagination because we need an accurate way to get
 * the next set of events when the items retrned by the server may have shifted.
 */
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

/**
 * A hook that allows you to access an `Event[]` of all in progress events.
 *
 * The benefit to using this hook is that it only returns in-progress events,
 * which is generally a small number of items. This is good for performantly
 * finding and rendering the status of an in-progress event.
 *
 * @example
 * const { data: events } = useInProgressEvents();
 *
 * const mostRecentLinodeEvent = events?.find(
 *   (e) => e.entity?.type === 'linode' && e.entity.id === id
 * );
 *
 * return (
 *   <p>Linode In Progress Event: {event.percent_complete}</p>
 * );
 */
export const useInProgressEvents = () => {
  return useQuery<Event[], APIError[]>({
    queryKey: ['events', 'poller', true],
  });
};

/**
 * Mounting this hook will start polling the events endpoint and
 * update our cache as new events come in.
 *
 * *Warning* This hook should only be mounted once!
 */
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

/**
 * Manages the events polling interval.
 */
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

/**
 * For all infinite event queries (with any filter), update each infinite query in
 * the cache.
 *
 * The catch here is that we must mimic the API filtering if we update an infinite query
 * with an API filter.
 */
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
        return doesEventMatchAPIFilter(event, apiFilter);
      });

      updateEventsQuery(filteredEvents, queryKey, queryClient);
    });
};

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

  if (filter?.['entity.id'] && filter['entity.id'] !== event.entity?.id) {
    return false;
  }

  if (filter?.['entity.type'] && filter['entity.type'] !== event.entity?.type) {
    return false;
  }

  return true;
};

/**
 * Updates a events infinite query with incoming events from our polling
 *
 * This method should do two things with incomming events
 * - If the events is already in the cache, update it
 * - If the event is new, append it to the top of the first page.
 */
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
