import { compose, sort, take } from 'ramda';
import { Reducer } from "redux";
import { ThunkAction } from "redux-thunk";
import { getEvents as _getEvents, markEventSeen } from 'src/services/account/events';

// State
type State = ApplicationState['events'];

export const defaultState: State = {
  events: [],
  lastUpdated: Date.now(),
  countUnseenEvents: 0,
};

// Actions
type AddEvents = (events: Linode.Event[]) => ({
  type: typeof ADD_EVENTS,
  payload: Linode.Event[];
})

type UpdateEventsAsSeen = () => ({
  type: typeof UPDATE_EVENTS_AS_SEEN,
})

const ADD_EVENTS = `@@manager/events/ADD_EVENTS`;

const UPDATE_EVENTS_AS_SEEN = `@@manager/events/UPDATE_EVENTS_AS_SEEN`;

const addEvents: AddEvents = (payload) => ({ type: ADD_EVENTS, payload });

const updateEventsAsSeen: UpdateEventsAsSeen = () => ({ type: UPDATE_EVENTS_AS_SEEN });

export const actions = {
  addEvents,
  updateEventsAsSeen,
};

// Reducer
const reducer: Reducer<State> = (state = defaultState, action) => {
  const { type } = action;

  switch (type) {
    case ADD_EVENTS:
      const events = truncateAndSortEvents(action.payload)

      return {
        ...state,
        events,
        lastUpdated: Date.now(),
        countUnseenEvents: getNumUnseenEvents(events),
      };

    case UPDATE_EVENTS_AS_SEEN:
      return {
        ...state,
        events: state.events.map(e => ({ ...e, seen: true })),
        countUnseenEvents: 0,
      }

    default:
      return state;
  }
};

export default reducer;

// Helpers
const truncateAndSortEvents = compose(
  /** We only display 25 */
  take<Linode.Event>(25),

  /** Sort by descending date. API should ofter ordering. */
  sort<Linode.Event>((a: Linode.Event, b: Linode.Event) => new Date(b.created).getTime() - new Date(a.created).getTime()),
);

const getNumUnseenEvents = (events: Linode.Event[]) => {
  const len = events.length;
  let unseenCount = 0;
  let idx = 0;
  while (idx < len) {
    if (!events[idx].seen) {
      unseenCount += 1;
    }

    idx += 1;
  }

  return unseenCount;
};

// Async
const getEvents: () => ThunkAction<Promise<Linode.Event[]>, ApplicationState, undefined>
  = () => (dispatch, getState) => {

    return _getEvents({ page_size: 25 })
      .then(response => response.data.data)
      .then((events) => {
        dispatch(addEvents(events));
        return events;
      })
  };

const markAllSeen: () => ThunkAction<Promise<any>, ApplicationState, undefined>
  = () => (dispatch, getState) => {
    const { events: { events } } = getState();
    const latestID = events.reduce((result, { id }) => id > result ? id : result, 0);

    return markEventSeen(latestID)
      .then(result => dispatch(updateEventsAsSeen()))
      .catch(error => null)
  };

  export const async = {
    getEvents,
    markAllSeen,
  }
