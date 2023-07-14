import { AnyAction, Reducer } from 'redux';
import { isType } from 'typescript-fsa';

import {
  addEvents,
  setPollingInterval,
  setRequestDeadline,
  updateEventsAsSeen,
} from './event.actions';
import {
  epoch,
  getNumUnseenEvents,
  mostRecentCreated,
  updateEvents,
  updateInProgressEvents,
} from './event.helpers';
import { ExtendedEvent } from './event.types';

export interface State {
  countUnseenEvents: number;
  events: ExtendedEvent[];
  inProgressEvents: Record<number, number>;
  mostRecentEventTime: number;
  pollingInterval: number;
  requestDeadline: number;
}

export const defaultState: State = {
  countUnseenEvents: 0,
  events: [],
  inProgressEvents: {},
  mostRecentEventTime: epoch,
  pollingInterval: 1,
  requestDeadline: Date.now(),
};

const reducer: Reducer<State> = (state = defaultState, action: AnyAction) => {
  if (isType(action, addEvents)) {
    const { payload: events } = action;
    const {
      events: prevEvents,
      inProgressEvents: prevInProgressEvents,
      mostRecentEventTime,
    } = state;
    const updatedEvents = updateEvents(prevEvents, events);

    return {
      ...state,
      countUnseenEvents: getNumUnseenEvents(updatedEvents),
      events: updatedEvents,
      inProgressEvents: updateInProgressEvents(prevInProgressEvents, events),
      mostRecentEventTime: events.reduce(
        mostRecentCreated,
        mostRecentEventTime
      ),
    };
  }

  if (isType(action, updateEventsAsSeen)) {
    return {
      ...state,
      countUnseenEvents: 0,
      events: state.events.map((event) => ({ ...event, seen: true })),
    };
  }

  if (isType(action, setPollingInterval)) {
    return {
      ...state,
      pollingInterval: action.payload,
    };
  }

  if (isType(action, setRequestDeadline)) {
    return {
      ...state,
      requestDeadline: action.payload,
    };
  }

  return state;
};

export default reducer;
