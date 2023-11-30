import { APIError, Event, ResourcePage, getEvents } from '@linode/api-v4';
import { useInfiniteQuery } from 'react-query';

export const useEventsInfiniteQuery = () => {
  const query = useInfiniteQuery<ResourcePage<Event>, APIError[]>(
    ['events', 'infinite'],
    ({ pageParam }) => getEvents({ page: pageParam }),
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
