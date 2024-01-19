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

import { ISO_DATETIME_NO_TZ_FORMAT } from 'src/constants';
import { useEventHandlers } from 'src/hooks/useEventHandlers';
import { useToastNotifications } from 'src/hooks/useToastNotifications';
import {
  doesEventMatchAPIFilter,
  generatePollingFilter,
  getExistingEventDataForPollingFilterGenerator,
} from 'src/queries/events/event.helpers';

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
    ({ pageParam }) =>
      getEvents(
        {},
        { ...filter, id: pageParam ? { '+lt': pageParam } : undefined }
      ),
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
    enabled: false,
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
  } = getExistingEventDataForPollingFilterGenerator(events, latestEventTime);

  const hasFetchedInitialEvents = events !== undefined;

  const filter = generatePollingFilter(
    latestEventTime,
    inProgressEvents,
    eventsThatAlreadyHappenedAtTheFilterTime
  );

  useQuery({
    enabled: hasFetchedInitialEvents,
    onSuccess(events) {
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
    // The /v4/account/events endpoint has a rate-limit of 400 requets per minute.
    // If we request events every 5 seconds, we will make 12 calls in 1 minute.
    // If we request events every 2.5 seconds, we will make 24 calls in 1 minute.
    // If we request events every 1 second, we will make 60 calls in 1 minute.
    refetchInterval: inProgressEvents.length > 0 ? 2_500 : 16_000,
  });

  return null;
};

/**
 * This hook manages the events polling interval.
 *
 * This hook should be used in application components that need to change
 * the events polling interval. It performs actions, but does not return any state
 * in hopes to prevent extra rendering.
 */
export const useEventsPollingActions = () => {
  const queryClient = useQueryClient();

  const resetEventsPolling = () =>
    queryClient.invalidateQueries(['events', 'poller']);

  return {
    /**
     * Sets the polling interval to 1 second so that events get polled faster temporarily
     *
     * The polling backoff will start over from 1 second.
     */
    resetEventsPolling,
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
