import { getEvents, markEventSeen } from '@linode/api-v4';
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { DISABLE_EVENT_THROTTLE, INTERVAL } from 'src/constants';
import { eventHandlers } from 'src/hooks/useEventHandlers';
import { useToastNotifications } from 'src/hooks/useToastNotifications';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { generatePollingFilter } from 'src/utilities/requestFilters';

import type { APIError, Event, Filter, ResourcePage } from '@linode/api-v4';

export const useEventsInfiniteQuery = (filter: Filter = {}) => {
  const query = useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    ['events', 'infinite', filter],
    ({ pageParam }) => getEvents({ page: pageParam }, filter),
    {
      getNextPageParam: ({ page, pages }) =>
        page < pages ? page + 1 : undefined,
    }
  );

  const events = query.data?.pages.reduce(
    (events, page) => [...page.data, ...events],
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
  const queryClient = useQueryClient();

  const { events } = useEventsInfiniteQuery();

  const latestEventTime = events ? events[0].created : '';

  // @todo run a reducde to optimize
  const inProgressEvents = events?.filter(isInProgressEvent);
  const eventsThatAlreadyHappenedAtTheFilterTime = events?.filter(
    (event) => event.created === latestEventTime
  );

  const hasFetchedInitialEvents = events !== undefined;

  const filter = generatePollingFilter(
    latestEventTime,
    inProgressEvents?.map((event) => event.id),
    eventsThatAlreadyHappenedAtTheFilterTime?.map((e) => e.id)
  );

  useQuery({
    enabled: hasFetchedInitialEvents,
    onSuccess(events) {
      incrementPollingInterval();

      const { existingEvents, newEvents } = events.reduce<{
        existingEvents: Event[];
        newEvents: Event[];
      }>(
        (acc, event) => {
          if (inProgressEvents?.some((e) => e.id === event.id)) {
            acc.existingEvents.push(event);
          } else {
            acc.newEvents.push(event);
          }
          return acc;
        },
        { existingEvents: [], newEvents: [] }
      );

      queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
        ['events', 'infinite', {}],
        (prev) => {
          const newPages = prev?.pages.map((page, index) => {
            if (index === 0 && newEvents.length > 0) {
              page.data = [...newEvents, ...page.data];
            }

            for (const event of existingEvents) {
              const indexOfEvent = page.data.findIndex(
                (e) => e.id === event.id
              );

              if (indexOfEvent !== -1) {
                page.data[index] = event;
              }
            }

            return page;
          });

          return {
            pageParams: prev?.pageParams ?? [],
            pages: newPages ?? [],
          };
        }
      );

      for (const event of events) {
        for (const eventHandler of eventHandlers) {
          if (eventHandler.filter(event)) {
            eventHandler.handler({ event, queryClient });
          }
        }
        handleGlobalToast(event);
      }
    },
    queryFn: () => getEvents({}, filter).then((data) => data.data),
    queryKey: ['events', 'poller'],
    refetchInterval: pollingInterval,
  });
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
          ['events', 'infinite', {}],
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
