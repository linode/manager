import store from '~/store';
import { getStorage } from '~/storage';
import { APP_ROOT, LOGIN_ROOT } from './constants';
import { clientId } from './secrets';
import { SET_TOKEN } from './actions/authentication';

export function initializeAuthentication(dispatch) {
  const token = getStorage('authentication/oauth-token') || null;
  const username = getStorage('authentication/username') || null;
  const email = getStorage('authentication/email') || null;
  const emailHash = getStorage('authentication/email-hash') || null;
  const scopes = getStorage('authentication/scopes') || null;
  const action = {
    type: SET_TOKEN, token, username, email, emailHash, scopes,
  };
  dispatch(action);
}

export default function checkLogin(next) {
  const state = store.getState();
  if (next.location.pathname !== '/oauth/callback'
      && state.authentication.token === null) {
    const query = Object.keys(next.location.query || {})
            .reduce((a, k) => [
              ...a,
              `${k}=${encodeURIComponent(next.location.query[k])}`,
            ], []).join('%26');
    /* eslint-disable prefer-template */
    window.location = `${LOGIN_ROOT}/oauth/authorize?` +
      `client_id=${clientId}` +
      '&scopes=*' +
      `&redirect_uri=${encodeURIComponent(APP_ROOT)}/oauth/callback?return=` +
            encodeURIComponent(next.location.pathname + (query ? '%3F' + query : ''));
    /* eslint-enable prefer-template */
  }
}
