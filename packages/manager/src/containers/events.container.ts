import { Event } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import React from 'react';
import { InfiniteData } from 'react-query';

import { EventsQueryOptions, useEventsInfiniteQuery } from 'src/queries/events';

export interface WithEventsInfiniteQueryProps {
  events?: Event[];
  eventsData?: InfiniteData<ResourcePage<Event>>;
  eventsLoading: boolean;
  resetEventsPolling: () => void;
}

export const withEventsInfiniteQuery = <Props>(
  options?: EventsQueryOptions
) => (Component: React.ComponentType<Props & WithEventsInfiniteQueryProps>) => (
  props: Props
) => {
  const {
    data: eventsData,
    events,
    isLoading: eventsLoading,
    resetEventsPolling,
  } = useEventsInfiniteQuery(options);

  return React.createElement(Component, {
    ...props,
    events,
    eventsData,
    eventsLoading,
    resetEventsPolling,
  });
};
