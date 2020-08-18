import * as React from 'react';
import useEvents from 'src/hooks/useEvents';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import { reducer } from './eventQueue';
import { NotificationItem } from '../NotificationSection';
import RenderEvent from './RenderEvent';

export const usePendingActions = () => {
  const { events } = useEvents();

  const [state, dispatch] = React.useReducer(reducer, {
    inProgressEvents: events.filter(isInProgressEvent),
    completedEvents: []
  });

  React.useEffect(() => {
    dispatch({ type: 'update', payload: { eventsFromRedux: events } });
  }, [events]);

  const allEvents = [...state.inProgressEvents, ...state.completedEvents];

  return allEvents
    .map(formatEventForDisplay)
    .filter(thisAction => Boolean(thisAction.body)) as NotificationItem[];
};

const formatEventForDisplay = (event: ExtendedEvent): NotificationItem => ({
  id: `pending-action-${event.id}`,
  body: <RenderEvent event={event} />
});

export default usePendingActions;
