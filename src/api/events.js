import { fetch } from '~/fetch';
import { events } from '~/api';
import { actions } from './configs/events';

export function eventRead(eventId) {
  return async (dispatch, getState) => {
    const state = getState();
    const { token } = state.authentication;
    await fetch(token, `/account/events/${eventId}/read`, { method: 'POST' });
    await dispatch(actions.invalidate([eventId], true));
    await dispatch(events.one([eventId]));
  };
}
