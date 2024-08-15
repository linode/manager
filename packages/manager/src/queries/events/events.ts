import { getEvents, markEventSeen } from '@linode/api-v4';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { useState } from 'react';

import { ISO_DATETIME_NO_TZ_FORMAT, POLLING_INTERVALS } from 'src/constants';
import { EVENTS_LIST_FILTER } from 'src/features/Events/constants';
import { useEventHandlers } from 'src/hooks/useEventHandlers';
import { useToastNotifications } from 'src/hooks/useToastNotifications';
import {
  doesEventMatchAPIFilter,
  generatePollingFilter,
  getExistingEventDataForPollingFilterGenerator,
  isInProgressEvent,
} from 'src/queries/events/event.helpers';

import type { APIError, Event, Filter, ResourcePage } from '@linode/api-v4';
import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from '@tanstack/react-query';

/**
 * Gets an infinitely scrollable list of all Events
 *
 * This query is kept up to date by `useEventsPoller`.
 *
 * @param filter an optional filter can be passed to filter out events. If you use a filter,
 * you must make sure `doesEventMatchAPIFilter` implements the same filtering so the cache is updated correctly.
 *
 * The magic here is that we're doing cursor based pagination using the event `id`.
 * We are doing this as opposed to page based pagination because we need an accurate way to get
 * the next set of events when the items returned by the server may have shifted.
 */

export const useEventsInfiniteQuery = (filter: Filter = EVENTS_LIST_FILTER) => {
  const LIMIT = 25;

  /**
   * On the first request (when we don't have a `pageParam`) we only want to get events
   * from the last 7 days.
   */
  const [defaultCreatedFilter] = useState(
    DateTime.now()
      .minus({ days: 7 })
      .setZone('utc')
      .toFormat(ISO_DATETIME_NO_TZ_FORMAT)
  );

  const query = useInfiniteQuery<ResourcePage<Event>, APIError[]>({
    cacheTime: Infinity,
    getNextPageParam: (lastPage, allPages) => {
      // Destructure the data array from the last page
      const { data } = lastPage;

      // Get the last event from the current page
      const lastEvent = data[data.length - 1];

      // If the last page is empty, we've reached the end of the data
      if (!lastEvent) {
        return undefined;
      }

      // Extract the 'created' date from the last event
      const { created: lastEventDate } = lastEvent;

      // Check if we have more than one page
      if (allPages.length > 1) {
        // Get the previous page
        const previousPage = allPages[allPages.length - 2];

        // Safely get the 'created' date of the last event from the previous page
        const previousLastEvent =
          previousPage.data[previousPage.data.length - 1];
        const previousLastEventDate = previousLastEvent?.created;

        // If the last event date of the current page matches the last event date of the previous page,
        // we've reached the end of unique data
        if (previousLastEventDate === lastEventDate) {
          return undefined;
        }
      }

      // If we haven't returned undefined, we have more data to fetch
      // Return the date of the last event as the next page parameter
      return lastEventDate;
    },
    queryFn: ({ pageParam }) =>
      getEvents(
        {},
        {
          ...filter,
          '+limit': LIMIT,
          '+order': 'desc',
          '+order_by': 'created',
          created: pageParam
            ? { '+lt': pageParam }
            : { '+gt': defaultCreatedFilter },
        }
      ),
    queryKey: ['events', 'infinite', filter],
    staleTime: Infinity,
  });

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
    queryKey: ['events', 'poller'],
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

  const hasFetchedInitialEvents = events !== undefined;

  const [mountTimestamp] = useState(
    DateTime.now().setZone('utc').toFormat(ISO_DATETIME_NO_TZ_FORMAT)
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
    queryFn: () => {
      const data = queryClient.getQueryData<InfiniteData<ResourcePage<Event>>>([
        'events',
        'infinite',
        EVENTS_LIST_FILTER,
      ]);
      const events = data?.pages.reduce(
        (events, page) => [...events, ...page.data],
        []
      );
      // If the user has events, poll for new events based on the most recent event's created time.
      // If the user has no events, poll events from the time the app mounted.
      const latestEventTime =
        events && events.length > 0 ? events[0].created : mountTimestamp;

      const {
        eventsThatAlreadyHappenedAtTheFilterTime,
        inProgressEvents,
      } = getExistingEventDataForPollingFilterGenerator(
        events,
        latestEventTime
      );

      const filter = generatePollingFilter(
        latestEventTime,
        inProgressEvents,
        eventsThatAlreadyHappenedAtTheFilterTime
      );

      return getEvents({}, filter).then((data) => data.data);
    },
    queryKey: ['events', 'poller'],
    refetchInterval: (data) => {
      const hasInProgressEvents = data?.some(isInProgressEvent);
      if (hasInProgressEvents) {
        return POLLING_INTERVALS.IN_PROGRESS;
      }
      return POLLING_INTERVALS.DEFAULT;
    },
  });

  return null;
};

/**
 * This hook returns functions that allow us to interact
 * with our events polling system.
 */
export const useEventsPollingActions = () => {
  const queryClient = useQueryClient();

  const checkForNewEvents = () => {
    // Invalidating the event poller will cause useEventsPoller's `queryFn`
    // to re-run and pull down any new events.
    queryClient.invalidateQueries({
      queryKey: ['events', 'poller'],
    });
  };

  return {
    /**
     * Makes a request to `/v4/account/events` to check for any new events.
     *
     * This function is intended to be called *after* initiating a long-running
     * event (like Linode create) so that Cloud Manager sees the new event and starts
     * polling at a faster rate. We do this to give Cloud Manager users a more
     * "realtime" feeling experience.
     */
    checkForNewEvents,
  };
};

export const useMarkEventsAsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation<{}, APIError[], number>(
    (eventId) => markEventSeen(eventId),
    {
      onSuccess: (_, eventId) => {
        queryClient.setQueriesData<InfiniteData<ResourcePage<Event>>>(
          ['events', 'infinite'],
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
 * This method should do two things with incoming events
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

        // Update the `results` value for all pages so it is up to date
        for (const page of prev.pages) {
          page.results += newEvents.length;
        }
      }

      return {
        pageParams: prev.pageParams,
        pages: prev.pages,
      };
    }
  );
};
