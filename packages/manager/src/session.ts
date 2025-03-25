import Axios from 'axios';

import { APP_ROOT, CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { generateCodeChallenge, generateCodeVerifier } from 'src/pkce';
import { getEnvLocalStorageOverrides } from 'src/utilities/storage';

import { setAuthCode } from './utilities/authentication';

import type { AuthCode } from './utilities/authentication';

// If there are local storage overrides, use those. Otherwise use variables set in the ENV.
const localStorageOverrides = getEnvLocalStorageOverrides();
const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;
const loginRoot = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;

/**
 * Generate an auth token and redirect to login to initiate the
 * authentication sequence.
 *
 * @param {string} returnToPath - The path the user will come back to
 * after authentication is complete
 * @param {string} queryString - any additional query you want to add
 * to the returnTo path
 */
export const redirectToLogin = async (
  returnToPath: string,
  queryString: string = ''
) => {
  const { codeVerifier, nonce } = await generateAuthCode();
  const redirectUri = `${returnToPath}${queryString}`;
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  setAuthCode({ codeVerifier, nonce });
  window.location.assign(
    genOAuthEndpoint({ codeChallenge, nonce, redirectUri })
  );
};

/**
 * Perform a request to login to revoke the current auth token.
 */
export const revokeToken = (clientId: string, token: string) => {
  return Axios({
    baseURL: loginRoot,
    data: new URLSearchParams({ client_id: clientId, token }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    method: 'POST',
    url: `/oauth/revoke`,
  });
};

const generateAuthCode = async (): Promise<AuthCode> => ({
  codeVerifier: await generateCodeVerifier(),
  nonce: crypto.randomUUID(),
});

/**
 * Creates a URL with the supplied props as a stringified query. The shape of the query is required
 * by the Login server.
 *
 * @param redirectUri {string}
 * @param scope {[string=*]}
 * @param nonce {string}
 * @returns {string} - OAuth authorization endpoint URL
 */
const genOAuthEndpoint = (options: {
  codeChallenge: string;
  nonce: string;
  redirectUri: string;
}): string => {
  if (!clientID) {
    throw new Error('No CLIENT_ID specified.');
  }

  const { codeChallenge, nonce, redirectUri } = options;

  const query = {
    client_id: clientID,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    response_type: 'code',
    scope: '*',
    state: nonce,
  };

  return `${loginRoot}/oauth/authorize?${new URLSearchParams(
    query
  ).toString()}`;
};
