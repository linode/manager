import { SET_TOKEN } from '../actions/authentication';
import { getStorage, setStorage } from '~/storage';

export default function authentication(_state = null, action) {
  const state = _state === null ? {
    token: getStorage('authentication/oauth-token'),
    username: getStorage('authentication/username'),
    email: getStorage('authentication/email'),
    scopes: getStorage('authentication/scopes'),
  } : _state;
  switch (action.type) {
    case SET_TOKEN:
      setStorage('authentication/oauth-token', action.token);
      setStorage('authentication/username', action.username);
      setStorage('authentication/email', action.email);
      setStorage('authentication/scopes', action.scopes);
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
