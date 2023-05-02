import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import {
  Entity,
  Event,
  getEvents,
  markEventSeen,
} from '@linode/api-v4/lib/account';
import { isInProgressEvent } from 'src/store/events/event.helpers';

export interface ExtendedEvent extends Event {
  _deleted?: string;
  _initial?: boolean;
}

export interface EntityEvent extends Omit<Event, 'entity'> {
  entity: Entity;
}

const queryKey = 'events';

export const useEventsPolling = (
  eventHandler?: (event: ExtendedEvent) => void
) => {
  useQuery<ExtendedEvent[], APIError[]>(
    [queryKey, 'polling'],
    async () => {
      const events = await requestUnseenEvents();
      await markCompletedEventsAsSeen(events);
      return events;
    },
    {
      refetchInterval: 5000,
      retryDelay: 5000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => eventHandler && data.forEach(eventHandler),
    }
  );
};

const requestUnseenEvents = (): Promise<ExtendedEvent[]> =>
  getEvents({ page_size: 25 }, { seen: false }).then(
    (response) => response.data
  );

const markCompletedEventsAsSeen = async (events: ExtendedEvent[]) => {
  const completedEvents = events
    .filter((event) => !isInProgressEvent(event))

    // We need to keep polling the event for any database that is still creating.
    // The same event will change its status from `notification` to `finished`.
    .filter(
      (event) =>
        !(event.action === 'database_create' && event.status === 'notification')
    );
  await Promise.all(completedEvents.map((event) => markEventSeen(event.id)));
};
