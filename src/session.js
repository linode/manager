import { stringify } from 'querystring';
import { v4 } from 'uuid';

import { setToken } from '~/actions/authentication';
import { APP_ROOT, LOGIN_ROOT, OAUTH_TOKEN_REFRESH_TIMEOUT } from '~/constants';
import { clientId } from '~/secrets';
import { getStorage, setStorage } from '~/storage';
import { store } from '~/store';

const AUTH_TOKEN = 'authentication/oauth-token';
const AUTH_SCOPES = 'authentication/scopes';
const AUTH_EXPIRES = 'authentication/expires';
const LATEST_REFRESH = 'authentication/latest-refresh';

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

export function refresh(dispatch) {
  const authToken = getStorage(AUTH_TOKEN);
  const scopes = getStorage(AUTH_SCOPES);
  dispatch(setToken(authToken, scopes));
}

export function expire(dispatch) {
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage(AUTH_TOKEN, '');
  setStorage(AUTH_SCOPES, '');
  setStorage(AUTH_EXPIRES, '');
  dispatch(setToken(null, null));
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

export function genOAuthEndpoint(redirectUri, scope = '*', nonce) {
  const query = {
    client_id: clientId,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce,
  };

  return `${LOGIN_ROOT}/oauth/authorize?${stringify(query)}`;
}

export function prepareOAuthEndpoint(redirectUri, scope = '*') {
  const nonce = v4();
  setStorage('authentication/nonce', nonce);
  return genOAuthEndpoint(redirectUri, scope, nonce);
}

export function redirectToLogin(path, querystring) {
  const redirectUri = `${path}${querystring && `%3F${querystring}`}`;
  window.location = prepareOAuthEndpoint(redirectUri);
}

export function refreshOAuthToken() {
  /*
   * This timestamp is for throttling the refresh process itself. It's
   * heavyweight because it hits localStorage. It's important to do this
   * because the user may have the app open in multiple tabs. We only do
   * this comparison once for each refresh attempt.
   */
  const latestRefresh = +getStorage(LATEST_REFRESH);
  if (Date.now() - latestRefresh < (OAUTH_TOKEN_REFRESH_TIMEOUT - 5000)) {
    return;
  }
  setStorage(LATEST_REFRESH, Date.now());
  /**
   * Open an iframe for two purposes
   * 1. Hits the login service (extends the lifetime of login session)
   * 2. Refreshes our OAuth token in localStorage
   */
  const iframe = document.createElement('iframe');
  iframe.src = prepareOAuthEndpoint('/null');
  iframe.style.display = 'none';
  const iframeContainer = document.getElementById('session-iframe');
  iframeContainer.appendChild(iframe);
  // Wait for the iframe to update localStorage, then move the creds into Redux
  setTimeout(() => store.dispatch(refresh), 3000);
  // Remove the iframe after it updates localStorage
  setTimeout(() => iframeContainer.removeChild(iframe), 5000);
}

export function refreshOAuthOnUserInteraction() {
  /*
   * This timestamp is for throttling events on this tab. The comparison is
   * lightweight because it's between integers and doesn't hit localStorage.
   * This is important because we do this comparison on every mouse and
   * keyboard event.
   */
  let currentExpiryTime = Date.now() + OAUTH_TOKEN_REFRESH_TIMEOUT;

  document.addEventListener('mousedown', () => {
    if (Date.now() >= currentExpiryTime) {
      refreshOAuthToken();
      currentExpiryTime = Date.now() + OAUTH_TOKEN_REFRESH_TIMEOUT;
    }
  });

  document.addEventListener('keydown', () => {
    if (Date.now() >= currentExpiryTime) {
      refreshOAuthToken();
      currentExpiryTime = Date.now() + OAUTH_TOKEN_REFRESH_TIMEOUT;
    }
  });
}
