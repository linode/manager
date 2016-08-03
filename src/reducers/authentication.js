import { SET_TOKEN } from '../actions/authentication';
import { getStorage, setStorage } from '~/storage';
import md5 from 'md5';

export default function authentication(_state = null, action) {
  const state = _state === null ? {
    token: getStorage('authentication/oauth-token'),
    username: getStorage('authentication/username'),
    email: getStorage('authentication/email'),
    emailHash: getStorage('authentication/email-hash'),
    scopes: getStorage('authentication/scopes'),
  } : _state;
  let emailHash = null;
  switch (action.type) {
    case SET_TOKEN:
      emailHash = action.emailHash;
      if (action.email && !!emailHash) {
        emailHash = md5(action.email.trim().toLowerCase());
      }
      setStorage('authentication/oauth-token', action.token);
      setStorage('authentication/username', action.username);
      setStorage('authentication/email', action.email);
      setStorage('authentication/email-hash', emailHash);
      setStorage('authentication/scopes', action.scopes);
      return {
        ...state,
        scopes: action.scopes,
        username: action.username,
        email: action.email,
        emailHash,
        token: action.token,
      };
    default:
      return state;
  }
}
