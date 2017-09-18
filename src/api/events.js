import { fetch } from '~/fetch';
import { actions } from './configs/events';

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

    const { token } = state.authentication;
    fetch(token, `/account/events/${eventId}/${action}`, { method: 'POST' });
  };
}

export const eventRead = eventAction('read');
export const eventSeen = eventAction('seen');
