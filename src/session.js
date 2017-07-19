import { setToken } from '~/actions/authentication';
import { APP_ROOT, LOGIN_ROOT } from '~/constants';
import { clientId } from '~/secrets';
import { getStorage, setStorage } from '~/storage';
import { store } from '~/store';


const AUTH_TOKEN = 'authentication/oauth-token';
const AUTH_SCOPES = 'authentication/scopes';
const AUTH_EXPIRES = 'authentication/expires';

export function redirect(location) {
  window.location = location;
}

export function loginAuthorizePath(returnTo) {
  /* eslint-disable prefer-template */
  return `${LOGIN_ROOT}/oauth/authorize?` +
         `client_id=${clientId}` +
         '&scopes=*' +
         `&redirect_uri=${encodeURIComponent(APP_ROOT)}/oauth/callback?return=${returnTo}`;
  /* eslint-enable prefer-template */
}

export function checkLogin(next) {
  const state = store.getState();
  if (next.location.pathname !== '/oauth/callback'
      && next.location.pathname !== '/logout'
      && state.authentication.token === null) {
    const query = Object.keys(next.location.query || {})
            .reduce((a, k) => [
              ...a,
              `${k}=${encodeURIComponent(next.location.query[k])}`,
            ], []).join('%26');

    // During testing we'll need to be able to replace this.
    const { redirect } = module.exports;
    const redirectTo = loginAuthorizePath(
      encodeURIComponent(`${next.location.pathname}${query ? `%3F${query}` : ''}`));
    redirect(redirectTo);
    return redirectTo;
  }

  return null;
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

export function expire(dispatch) {
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage(AUTH_TOKEN, '');
  setStorage(AUTH_SCOPES, '');
  setStorage(AUTH_EXPIRES, '');
  dispatch(setToken(null, null));
}

export function expireAndReAuth(dispatch) {
  dispatch(expire);
  checkLogin(window);
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
