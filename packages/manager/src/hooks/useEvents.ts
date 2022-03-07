import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { ExtendedEvent } from 'src/store/events/event.types';

export interface UseEvents {
  events: ExtendedEvent[];
  inProgressEvents: ExtendedEvent[];
}

export const useEvents = () => {
  const eventState = useSelector((state: ApplicationState) => state.events);
  const events = eventState.events;
  const inProgressIDs = Object.keys(eventState.inProgressEvents);
  const inProgressEvents = events.filter((thisEvent) =>
    inProgressIDs.includes(String(thisEvent.id))
  );

  return { events, inProgressEvents };
};

export default useEvents;
