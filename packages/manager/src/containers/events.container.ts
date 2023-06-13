import { Event } from '@linode/api-v4/lib/account';
import { ResourcePage } from '@linode/api-v4/lib/types';
import React from 'react';
import { InfiniteData } from 'react-query';
import { EventsQueryOptions, useEventsInfiniteQuery } from 'src/queries/events';

interface EventsInfiniteQueryProps {
  eventsData?: InfiniteData<ResourcePage<Event>>;
  eventsLoading: boolean;
}

export const withEventsInfiniteQuery = <Props>(
  options?: EventsQueryOptions
) => (Component: React.ComponentType<Props & EventsInfiniteQueryProps>) => (
  props: Props
) => {
  const { data: eventsData, isLoading: eventsLoading } = useEventsInfiniteQuery(
    options
  );

  return React.createElement(Component, {
    ...props,
    eventsData,
    eventsLoading,
  });
};
