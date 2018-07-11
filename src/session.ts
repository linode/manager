import { stringify } from 'querystring';
import { v4 } from 'uuid';

import { APP_ROOT, CLIENT_ID, LOGIN_ROOT, OAUTH_TOKEN_REFRESH_TIMEOUT } from 'src/constants';
import { getStorage, setStorage } from 'src/storage';
import store from 'src/store';
import { setToken } from 'src/store/reducers/authentication';


export const AUTH_TOKEN = 'authentication/oauth-token';
export const AUTH_SCOPES = 'authentication/scopes';
export const AUTH_EXPIRE_DATETIME = 'authentication/expire-datetime';
export const LATEST_REFRESH = 'authentication/latest-refresh';

export function start(oauthToken = '', scopes = '', expires = '') {
  // Set these two so we can grab them on subsequent page loads
  setStorage(AUTH_TOKEN, oauthToken);
  setStorage(AUTH_SCOPES, scopes);
  setStorage(AUTH_EXPIRE_DATETIME, expires);

  // Add all to state for this (page load) session
  store.dispatch(setToken(oauthToken, scopes));
}

export function refresh() {
  const authToken = getStorage(AUTH_TOKEN);
  const scopes = getStorage(AUTH_SCOPES);
  store.dispatch(setToken(authToken, scopes));
}

export function expire() {
  // Remove these from local storage so if login fails, next time we jump to login sooner.
  setStorage(AUTH_TOKEN, '');
  setStorage(AUTH_SCOPES, '');
  setStorage(AUTH_EXPIRE_DATETIME, '');
  store.dispatch(setToken(null, null));
}

export function initialize() {
  const expires = getStorage(AUTH_EXPIRE_DATETIME) || null;
  if (expires && new Date(expires) < new Date()) {
    expire();
    return;
  }

  const token = getStorage(AUTH_TOKEN) || null;
  const scopes = getStorage(AUTH_SCOPES) || null;
  // Calling this makes sure AUTH_EXPIRE_DATETIME is always set.
  start(token, scopes, expires);
}

export function genOAuthEndpoint(redirectUri: string, scope = '*', nonce: string) {
  const query = {
    client_id: CLIENT_ID,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce,
  };

  return `${LOGIN_ROOT}/oauth/authorize?${stringify(query)}`;
}

export function prepareOAuthEndpoint(redirectUri: string, scope = '*') {
  const nonce = v4();
  setStorage('authentication/nonce', nonce);
  return genOAuthEndpoint(redirectUri, scope, nonce);
}

export function redirectToLogin(path: string, querystring: string) {
  const redirectUri = `${path}${querystring && `${querystring}`}`;
  window.location.href = prepareOAuthEndpoint(redirectUri);
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
  setStorage(LATEST_REFRESH, Date.now().toString());
  /**
   * Open an iframe for two purposes
   * 1. Hits the login service (extends the lifetime of login session)
   * 2. Refreshes our OAuth token in localStorage
   */
  const iframe = document.createElement('iframe');
  /* bounce through the implicit flow back to a blank page that uses the
     AuthenticationWrapper */
  iframe.src = prepareOAuthEndpoint('/nullauth');
  iframe.style.display = 'none';
  const iframeContainer = document.getElementById('session-iframe');
  if (!iframeContainer) {
    throw new Error('no iframe container for oauth token refresh');
  }
  iframeContainer.appendChild(iframe);
  // Wait for the iframe to update localStorage, then move the creds into Redux
  setTimeout(() => refresh(), 3000);
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
