import { APIError } from '@linode/api-v4/lib/types';
import { QueryClient, useQuery, useQueryClient } from 'react-query';
import { Entity, Event } from '@linode/api-v4/lib/account';
import { requestEvents } from 'src/events';
import { useEffect } from 'react';

export interface EventsState {
  events: ExtendedEvent[];
  mostRecentEventTime: number;
  countUnseenEvents: number;
  inProgressEvents: Record<number, number>;
  pollingInterval: number;
  requestDeadline: number;
}

export interface ExtendedEvent extends Event {
  _deleted?: string;
  _initial?: boolean;
}

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

export const queryKey = 'events';

export type EventHandler = (event: ExtendedEvent) => void;

const dispatchEvents = (
  events: ExtendedEvent[],
  eventHandlers: Set<EventHandler>
) => {
  events.forEach((event) =>
    Array.from(eventHandlers.values()).forEach((handler) => handler(event))
  );
};

const eventsCacheKey = [queryKey, 'cache'];
export const useEventsPolling = (
  eventHandler: (event: ExtendedEvent) => void
) => {
  const queryClient = useQueryClient();

  const eventHandlers = getEventHandlers(queryClient);
  useEffect(() => {
    eventHandlers.add(eventHandler);
    return () => {
      eventHandlers.delete(eventHandler);
    };
  }, [eventHandler, eventHandlers]);

  return useQuery<EventsState, APIError[]>(eventsCacheKey, async () => {
    const eventsCache = queryClient.getQueryData<EventsState>(queryKey);
    const { eventsState, newEvents } = await requestEvents(eventsCache);
    dispatchEvents(newEvents, eventHandlers);
    return eventsState;
  });
};

const eventHandlersKey = [queryKey, 'handlers'];
const getEventHandlers = (queryClient: QueryClient) =>
  queryClient.getQueryData<Set<EventHandler>>(eventHandlersKey) ??
  queryClient.setQueryData<Set<EventHandler>>(eventHandlersKey, new Set());
