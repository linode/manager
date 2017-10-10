import { actions } from '../generic/events';
import { fetch } from '../fetch';


export function eventAction(action) {
  return (eventId) => async (dispatch, getState) => {
    const state = getState();

    if (action === 'seen') {
      // Mark all events seen. Using many to avoid a dispatch per event.
      const page = {
        pages: state.api.events.totalPages,
        results: state.api.events.totalResults,
        events: Object.values(state.api.events.events).reduce(
          (unseen, e) => e.seen ? unseen : [...unseen, { ...e, seen: true }], []) || [],
      };
      dispatch(actions.many(page));
    } else {
      const event = state.api.events.events[eventId];
      await dispatch(actions.one({ ...event, [action]: true }, eventId));
    }

    return dispatch(fetch.post(`/account/events/${eventId}/${action}`));
  };
}

export const eventRead = eventAction('read');
export const eventSeen = eventAction('seen');
