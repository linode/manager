import { getEvents } from '@linode/api-v4';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';

import { DISABLE_EVENT_THROTTLE, INTERVAL } from 'src/constants';
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
  return useQuery<ResourcePage<Event>, APIError[]>({
    queryKey: ['events', 'poller'],
  });
};

export const useEventsPoller = () => {
  const { incrementPollingInterval, pollingInterval } = usePollingInterval();

  const { events } = useEventsInfiniteQuery();

  const latestEventTime = events ? events[0].created : '';

  const inProgressEvents = events?.filter(isInProgressEvent);

  const hasFetchedInitialEvents = events !== undefined;

  const filter = generatePollingFilter(
    latestEventTime,
    inProgressEvents?.map((event) => event.id)
  );

  useQuery({
    enabled: hasFetchedInitialEvents,
    onSuccess() {
      incrementPollingInterval();
    },
    queryFn: () => getEvents({}, filter),
    queryKey: ['events', 'poller'],
    refetchInterval: pollingInterval,
  });
};

const usePollingInterval = () => {
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
    resetPollingInterval: () => queryClient.setQueryData<number>(queryKey, 1),
  };
};
