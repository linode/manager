import { SET_TOKEN } from '../actions/authentication';
import { getStorage, setStorage } from '~/storage';

export default function authentication(_state = null, action) {
  const state = _state === null ? {
    token: getStorage('authentication/oauth-token'),
  } : _state;
  switch (action.type) {
    case SET_TOKEN:
      setStorage('authentication/oauth-token', action.token);
      return {
        ...state,
        scopes: action.scopes,
        username: action.username,
        email: action.email,
        token: action.token,
      };
    default:
      return state;
  }
}
