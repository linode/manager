import { AnyAction, Reducer } from 'redux';
import { isType } from 'typescript-fsa';
import {
  addEvents,
  setPollingInterval,
  setRequestDeadline,
  updateEventsAsSeen
} from './event.actions';
import {
  epoch,
  ExtendedEvent,
  getNumUnseenEvents,
  mostRecentCreated,
  updateEvents,
  updateInProgressEvents
} from './event.helpers';

export interface State {
  events: ExtendedEvent[];
  mostRecentEventTime: number;
  countUnseenEvents: number;
  inProgressEvents: Record<number, number>;
  pollingInterval: number;
  requestDeadline: number;
}

export const defaultState: State = {
  events: [],
  mostRecentEventTime: epoch,
  countUnseenEvents: 0,
  inProgressEvents: {},
  pollingInterval: 1,
  requestDeadline: Date.now()
};

const reducer: Reducer<State> = (state = defaultState, action: AnyAction) => {
  if (isType(action, addEvents)) {
    const { payload: events } = action;
    const {
      events: prevEvents,
      inProgressEvents: prevInProgressEvents,
      mostRecentEventTime
    } = state;
    const updatedEvents = updateEvents(prevEvents, events);

    return {
      ...state,
      events: updatedEvents,
      mostRecentEventTime: events.reduce(
        mostRecentCreated,
        mostRecentEventTime
      ),
      countUnseenEvents: getNumUnseenEvents(updatedEvents),
      inProgressEvents: updateInProgressEvents(prevInProgressEvents, events)
    };
  }

  if (isType(action, updateEventsAsSeen)) {
    return {
      ...state,
      events: state.events.map(event => ({ ...event, seen: true })),
      countUnseenEvents: 0
    };
  }

  if (isType(action, setPollingInterval)) {
    return {
      ...state,
      pollingInterval: action.payload
    };
  }

  if (isType(action, setRequestDeadline)) {
    return {
      ...state,
      requestDeadline: action.payload
    };
  }

  return state;
};

export default reducer;
