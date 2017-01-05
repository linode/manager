import { fetch } from '~/fetch';
import { actions } from './configs/events';

export function eventAction(action) {
  return (eventId) => async (dispatch, getState) => {
    const state = getState();

    const event = state.api.events.events[eventId];
    await dispatch(actions.one({ ...event, [action]: true }, eventId));

    if (action === 'seen') {
      Object.keys(state.api.events.events).forEach(eventId =>
        dispatch(actions.one({ seen: true }, eventId)));
    }

    const { token } = state.authentication;
    fetch(token, `/account/events/${eventId}/${action}`, { method: 'POST' });
  };
}

export const eventRead = eventAction('read');
export const eventSeen = eventAction('seen');
