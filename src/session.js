import { stringify } from 'querystring';
import { v4 } from 'uuid';

import { setToken } from '~/actions/authentication';
import { APP_ROOT, LOGIN_ROOT } from '~/constants';
import { clientId } from '~/secrets';
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

export const genOAuthEndpoint = (redirectUri, scope = '*', nonce) => {
  const query = {
    client_id: clientId,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce,
  };

  return `${LOGIN_ROOT}/oauth/authorize?${stringify(query)}`;
};

export const prepareOAuthEndpoint = (redirectUri, scope = '*') => {
  const nonce = v4();
  setStorage('authentication/nonce', nonce);
  genOAuthEndpoint(redirectUri, scope, nonce);
};

export function redirectToLogin(path, querystring) {
  const redirectUri = `${path}${querystring && `%3F${querystring}`}`;
  window.location = prepareOAuthEndpoint(redirectUri);
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
