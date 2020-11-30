import { Event } from '@linode/api-v4/lib/account/types';
import { isInProgressEvent } from 'src/store/events/event.helpers';
interface Payload {
  eventsFromRedux: Event[];
}

export interface ReducerState {
  inProgressEvents: Event[];
  completedEvents: Event[];
}

export interface ReducerActions {
  type: 'update';
  payload: Payload;
}

export const initEventReducerState: ReducerState = {
  inProgressEvents: [],
  completedEvents: []
};

type EventsReducer = React.Reducer<ReducerState, ReducerActions>;

export const reducer: EventsReducer = (state, action) => {
  const {
    payload: { eventsFromRedux }
  } = action;

  if (action.type === 'update') {
    const newInProgressEvents = eventsFromRedux.filter(isInProgressEvent);
    const currentEventIds = state.inProgressEvents.map(e => e.id);
    const newlyCompletedEvents = eventsFromRedux.filter(thisEvent => {
      return (
        currentEventIds.includes(thisEvent.id) &&
        thisEvent.percent_complete === 100
      );
    });
    return {
      inProgressEvents: newInProgressEvents,
      completedEvents: [...state.completedEvents, ...newlyCompletedEvents]
    };
  } else {
    return state;
  }
};
