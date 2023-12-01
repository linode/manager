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

      queryClient.setQueryData<InfiniteData<ResourcePage<Event>>>(
        ['events', 'infinite', {}],
        (prev) => {
          if (!prev) {
            return {
              pages: [],
              pageParams: [],
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
