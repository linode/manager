import Axios from 'axios';

import { APP_ROOT, CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { generateCodeChallenge, generateCodeVerifier } from 'src/pkce';
import { clearNonceAndCodeVerifierFromLocalStorage } from 'src/store/authentication/authentication.helpers';
import {
  authentication,
  getEnvLocalStorageOverrides,
} from 'src/utilities/storage';

// If there are local storage overrides, use those. Otherwise use variables set in the ENV.
const localStorageOverrides = getEnvLocalStorageOverrides();
const clientID = localStorageOverrides?.clientID ?? CLIENT_ID;
const loginRoot = localStorageOverrides?.loginRoot ?? LOGIN_ROOT;

let codeVerifier: string = '';
let codeChallenge: string = '';

export async function generateCodeVerifierAndChallenge(): Promise<void> {
  codeVerifier = await generateCodeVerifier();
  codeChallenge = await generateCodeChallenge(codeVerifier);
  authentication.codeVerifier.set(codeVerifier);
}

/**
 * Creates a URL with the supplied props as a stringified query. The shape of the query is required
 * by the Login server.
 *
 * @param redirectUri {string}
 * @param scope {[string=*]}
 * @param nonce {string}
 * @returns {string} - OAuth authorization endpoint URL
 */
export const genOAuthEndpoint = (
  redirectUri: string,
  scope: string = '*',
  nonce: string
): string => {
  if (!clientID) {
    throw new Error('No CLIENT_ID specified.');
  }

  const query = {
    client_id: clientID,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${redirectUri}`,
    response_type: 'code',
    scope,
    state: nonce,
  };

  return `${loginRoot}/oauth/authorize?${new URLSearchParams(
    query
  ).toString()}`;
};

/**
 * Generate a nonce (a UUID), store it in localStorage for later comparison, then create the URL
 * we redirect to.
 *
 * @param redirectUri {string}
 * @param scope {string}
 * @returns {string} - OAuth authorization endpoint URL
 */
export const prepareOAuthEndpoint = (
  redirectUri: string,
  scope: string = '*'
): string => {
  const nonce = window.crypto.randomUUID();
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
export const redirectToLogin = async (
  returnToPath: string,
  queryString: string = ''
) => {
  clearNonceAndCodeVerifierFromLocalStorage();
  await generateCodeVerifierAndChallenge();
  const redirectUri = `${returnToPath}${queryString}`;
  window.location.assign(prepareOAuthEndpoint(redirectUri));
};

export interface RevokeTokenSuccess {
  success: true;
}

export const revokeToken = (client_id: string, token: string) => {
  return Axios({
    baseURL: loginRoot,
    data: new URLSearchParams({ client_id, token }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    method: 'POST',
    url: `/oauth/revoke`,
  });
};
