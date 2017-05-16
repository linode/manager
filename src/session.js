import { store } from '~/store';
import { APP_ROOT, LOGIN_ROOT } from './constants';
import { clientId } from './secrets';
import { SET_TOKEN } from './actions/authentication';
import { getStorage } from '~/storage';

export function initializeAuthentication(dispatch) {
  const token = getStorage('authentication/oauth-token') || null;
  const scopes = getStorage('authentication/scopes') || null;
  dispatch({ type: SET_TOKEN, token, scopes });
}

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
