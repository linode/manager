import { actions } from '../generic/profile';
import { fetch } from '../fetch';


export function setPassword(password, expires) {
  return (dispatch) => dispatch(fetch.post('/profile/password', { password, expires }));
}

export function toggleTFA(enable) {
  return async (dispatch, getState) => {
    const result = await dispatch(fetch.post(
      `/profile/tfa-${enable ? 'enable' : 'disable'}`));
    if (!enable) {
      const { profile } = getState().api;
      dispatch(actions.one({ ...profile, two_factor_auth: false }));
    }
    return result;
  };
}

export function confirmTFA(code) {
  return async (dispatch, getState) => {
    const result = await dispatch(fetch.post('/profile/tfa-enable-confirm', {
      tfa_code: code,
    }));
    const { profile } = getState().api;
    dispatch(actions.one({ ...profile, two_factor_auth: true }));
    return result;
  };
}
