import { stringify } from 'querystring';
import { Dispatch } from 'redux';
import {
  APP_ROOT,
  CLIENT_ID,
  LOGIN_ROOT,
  OAUTH_TOKEN_REFRESH_TIMEOUT
} from 'src/constants';
import { handleRefreshTokens } from 'src/store/authentication/authentication.actions';
import { authentication } from 'src/utilities/storage';
import { v4 } from 'uuid';

/**
 * Creates a URL with the supplied props as a stringified query. The shape of the query is required
 * by the Login server.
 *
 * @param redirectUri {string}
 * @param scope {[string=*]}
 * @param nonce {string}
 */
export const genOAuthEndpoint = (
  redirectUri: string,
  scope = '*',
  nonce: string
) => {
  const query = {
    client_id: CLIENT_ID,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce
  };

  return `${LOGIN_ROOT}/oauth/authorize?${stringify(query)}`;
};

/**
 * Generate a nonce (a UUID), store it in localStorage for later comparison, then create the URL
 * we redirect to.
 *
 * @param redirectUri {string}
 * @param scope {string}
 */
export const prepareOAuthEndpoint = (redirectUri: string, scope = '*') => {
  const nonce = v4();
  authentication.nonce.set(nonce);
  return genOAuthEndpoint(redirectUri, scope, nonce);
};

/**
 * It's in the name.
 *
 * @param {string} returnToPath - The path the user will come back to
 * after authentication is complete
 * @param {string} queryString - any additional query you want to add
 * to the returnTo path
 */
export const redirectToLogin = (
  returnToPath: string,
  queryString: string = ''
) => {
  const redirectUri = `${returnToPath}${queryString}`;
  window.location.assign(prepareOAuthEndpoint(redirectUri));
};

export const refreshOAuthToken = (dispatch: Dispatch) => {
  /**
   * Open an iframe for two purposes
   * 1. Hits the login service (extends the lifetime of login session)
   * 2. Refreshes our OAuth token in localStorage
   */
  const iframe = document.createElement('iframe');
  iframe.src = prepareOAuthEndpoint('/null');
  iframe.style.display = 'none';
  const iframeContainer = document.getElementById('session-iframe');
  if (!iframeContainer) {
    return null;
  }
  iframeContainer.appendChild(iframe);
  // Remove the iframe once it refreshes OAuth token in localStorage
  setTimeout(() => iframeContainer.removeChild(iframe), 5000);
  // Move the OAuth token from localStorage into Redux
  dispatch(handleRefreshTokens);
  // Do this again in a little while
  setTimeout(() => refreshOAuthToken(dispatch), OAUTH_TOKEN_REFRESH_TIMEOUT);
  return null;
};
