import { setToken } from '~/actions/authentication';
import { APP_ROOT, LOGIN_ROOT } from '~/constants';
import { clientId } from '~/secrets';
import { getStorage, setStorage } from '~/storage';
import { store } from '~/store';


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
  const token = getStorage('authentication/oauth-token') || null;
  const scopes = getStorage('authentication/scopes') || null;
  dispatch(setToken(token, scopes));
}

export function expire(dispatch) {
  const next = { location: window.location };
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage('authentication/oauth-token', '');
  setStorage('authentication/scopes', '');
  dispatch(setToken(null, null));
  checkLogin(next);
}

export function start(oauthToken = '', scopes = '') {
  return (dispatch) => {
    // Set these two so we can grab them on subsequent page loads
    setStorage('authentication/oauth-token', oauthToken);
    setStorage('authentication/scopes', scopes);
    // Add all to state for this (page load) session
    dispatch(setToken(oauthToken, scopes));
  };
}
