import { setToken } from '~/actions/authentication';
import { getStorage, setStorage } from '~/storage';
const AUTH_TOKEN = 'authentication/oauth-token';
const AUTH_SCOPES = 'authentication/scopes';
const AUTH_EXPIRES = 'authentication/expires';


export function expire(dispatch) {
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage(AUTH_TOKEN, '');
  setStorage(AUTH_SCOPES, '');
  setStorage(AUTH_EXPIRES, '');
  dispatch(setToken(null, null));
}

export function start(oauthToken = '', scopes = '', expires) {
  return (dispatch) => {
    // Set these two so we can grab them on subsequent page loads
    setStorage(AUTH_TOKEN, oauthToken);
    setStorage(AUTH_SCOPES, scopes);
    setStorage(AUTH_EXPIRES, expires);

    // Add all to state for this (page load) session
    dispatch(setToken(oauthToken, scopes));
  };
}

export function initialize(dispatch) {
  const expires = getStorage(AUTH_EXPIRES) || null;
  if (expires && new Date(expires) < new Date()) {
    // Calling expire makes sure the full expire steps are taken.
    return dispatch(expire);
  }

  const token = getStorage(AUTH_TOKEN) || null;
  const scopes = getStorage(AUTH_SCOPES) || null;
  // Calling this makes sure AUTH_EXPIRES is always set.
  dispatch(start(token, scopes, expires));
}
