import { AnyAction, Reducer } from "redux";
import { isType } from 'typescript-fsa';
import { addEvents, updateEventsAsSeen } from './event.actions';
import { epoch, getNumUnseenEvents, mostRecentCreated, updateEvents, updateInProgressEvents } from './event.helpers';


type State = ApplicationState['events'];

export const defaultState: State = {
  events: [],
  mostRecentEventTime: epoch,
  countUnseenEvents: 0,
  inProgressEvents: {},
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
      events: updatedEvents,
      mostRecentEventTime: events.reduce(mostRecentCreated, mostRecentEventTime),
      countUnseenEvents: getNumUnseenEvents(updatedEvents),
      inProgressEvents: updateInProgressEvents(prevInProgressEvents, events),
    };
  }

  if (isType(action, updateEventsAsSeen)) {
    return {
      ...state,
      events: state.events.map((event) => ({ ...event, seen: true })),
      countUnseenEvents: 0,
    }
  }

  return state;
};

export default reducer;
