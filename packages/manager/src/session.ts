import { stringify } from 'querystring';
import { APP_ROOT, CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { authentication } from 'src/utilities/storage';
import { v4 } from 'uuid';
import { isDevToolEnabled } from './dev-tools/load';

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
  // @todo: clean this.

  let finalClientID;
  if (isDevToolEnabled() && window.localStorage['dev-tools-client-id']) {
    finalClientID = window.localStorage['dev-tools-client-id'];
  } else {
    finalClientID = CLIENT_ID;
  }

  const loginRoot =
    isDevToolEnabled() && window.localStorage['dev-tools-login-root']
      ? window.localStorage['dev-tools-login-root']
      : LOGIN_ROOT;

  const query = {
    client_id: finalClientID,
    scope,
    response_type: 'token',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    state: nonce
  };

  return `${loginRoot}/oauth/authorize?${stringify(query)}`;
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
