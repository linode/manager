import { stringify } from 'querystring';
import { v4 } from 'uuid';

import { setToken } from 'src/actions/authentication';
import { CLIENT_ID, APP_ROOT, LOGIN_ROOT, OAUTH_TOKEN_REFRESH_INTERVAL } from 'src/constants';
import { getStorage, setStorage } from 'src/storage';

const AUTH_TOKEN = 'authentication/oauth-token';
const AUTH_SCOPES = 'authentication/scopes';
const AUTH_EXPIRE_DATETIME = 'authentication/expire-datetime';

export function start(oauthToken = '', scopes = '', expires = '') {
  return (dispatch) => {
    // Set these two so we can grab them on subsequent page loads
    setStorage(AUTH_TOKEN, oauthToken);
    setStorage(AUTH_SCOPES, scopes);
    setStorage(AUTH_EXPIRE_DATETIME, expires);

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
  setStorage(AUTH_EXPIRE_DATETIME, '');
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
    client_id: CLIENT_ID,
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

export function refreshOAuthToken(dispatch) {
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
  // Remove the iframe once it refreshes OAuth token in localStorage
  setTimeout(() => iframeContainer.removeChild(iframe), 5000);
  // Move the OAuth token from localStorage into Redux
  dispatch(refresh);
  // Do this again in a little while
  setTimeout(() => dispatch(refreshOAuthToken), OAUTH_TOKEN_REFRESH_INTERVAL);
}
