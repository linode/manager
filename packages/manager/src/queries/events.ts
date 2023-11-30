import { getEvents } from '@linode/api-v4';
import { useInfiniteQuery } from 'react-query';

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
    (events, page) => [...events, ...page.data],
    []
  );

  return { ...query, events };
};
