import { store } from '~/store';
import { APP_ROOT, LOGIN_ROOT } from './constants';
import { clientId } from './secrets';
import { SET_TOKEN } from './actions/authentication';
import { getStorage, setStorage } from '~/storage';

export function initializeAuthentication(dispatch) {
  const token = getStorage('authentication/oauth-token') || null;
  const scopes = getStorage('authentication/scopes') || null;
  dispatch({ type: SET_TOKEN, token, scopes });
}

export function redirect(location) {
  window.location = location;
}

// Source: https://gist.github.com/jed/982883
function uuid4(a) {
  return a ? (
    a ^ Math.random() * 16 >> a / 4
  ).toString(16) : (
    [1e7] + -1e3 + -4e3 + -8e3 + -1e11
  ).replace(/[018]/g, uuid4);
}

export function loginAuthorizePath(returnTo) {
  const nonce = uuid4();
  setStorage('authentication/nonce', nonce);
  /* eslint-disable prefer-template */
  return `${LOGIN_ROOT}/oauth/authorize?` +
         `client_id=${clientId}` +
         '&scopes=*' +
         '&response_type=token' +
         `&state=${nonce}` +
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
