/* eslint-disable no-console */
import { capitalize, getQueryParamsFromQueryString } from '@linode/utilities';
import * as Sentry from '@sentry/react';
import { useLocation } from 'react-router-dom';
import { object, string } from 'yup';

import { APP_ROOT, CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import {
  authentication,
  clearUserInput,
  getEnvLocalStorageOverrides,
  storage,
} from 'src/utilities/storage';

import { generateCodeChallenge, generateCodeVerifier } from './pkce';

interface TokensWithExpiry {
  /**
   * The expiry of the token
   *
   * I don't know why someone decided to store this as a crazy string.
   *
   * @example "Wed Jun 04 2025 23:29:48 GMT-0400 (Eastern Daylight Time)"
   */
  expires: string;
  /**
   * The OAuth scopes
   *
   * @example "*"
   */
  scopes: string;
  /**
   * The token including the prefix
   *
   * @example "Bearer 12345" or "Admin 12345"
   */
  token: string;
}

export function setAuthDataInLocalStorage({
  scopes,
  token,
  expires,
}: TokensWithExpiry) {
  storage.authentication.scopes.set(scopes);
  storage.authentication.token.set(token);
  storage.authentication.expire.set(expires);
}

export function clearAuthDataFromLocalStorage() {
  storage.authentication.scopes.clear();
  storage.authentication.token.clear();
  storage.authentication.expire.clear();
}

function clearNonceAndCodeVerifierFromLocalStorage() {
  storage.authentication.nonce.clear();
  storage.authentication.codeVerifier.clear();
}

function clearAllAuthDataFromLocalStorage() {
  clearNonceAndCodeVerifierFromLocalStorage();
  clearAuthDataFromLocalStorage();
}

export function getIsLoggedInAsCustomer() {
  const token = storage.authentication.token.get();

  if (!token) {
    return false;
  }

  return token.toLowerCase().includes('admin');
}

export function useOAuth() {
  const location = useLocation();
  const token = storage.authentication.token.get();

  const isPendingAuthentication =
    location.pathname.includes('/oauth/callback') ||
    location.pathname.includes('/admin/callback') ||
    window.location.pathname.includes('/oauth/callback') ||
    window.location.pathname.includes('/admin/callback');

  // If no token is stored and we are not in the process of authentication, redirect to login.
  if (!token && !isPendingAuthentication) {
    redirectToLogin(window.location.pathname, window.location.search);
  }

  return { isPendingAuthentication };
}

function getLoginURL() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  return localStorageOverrides?.loginRoot ?? LOGIN_ROOT;
}

function getClientId() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  const clientId = localStorageOverrides?.clientID ?? CLIENT_ID;

  if (!clientId) {
    throw new Error('No CLIENT_ID specified.');
  }

  return clientId;
}

export async function logout() {
  const localStorageOverrides = getEnvLocalStorageOverrides();
  const loginUrl = getLoginURL();
  const clientId = localStorageOverrides?.clientID ?? CLIENT_ID;
  const token = storage.authentication.token.get();

  clearUserInput();
  clearAuthDataFromLocalStorage();

  if (clientId && token) {
    const tokenWithoutPrefix = token.split(' ')[1];

    try {
      await revokeToken(clientId, tokenWithoutPrefix);
    } catch (error) {
      console.error(
        `Unable to revoke OAuth token by calling POST ${loginUrl}/oauth/revoke.`,
        error
      );
    }
  }

  window.location.assign(`${loginUrl}/logout`);
}

async function generateCodeVerifierAndChallenge() {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  authentication.codeVerifier.set(codeVerifier);
  return { codeVerifier, codeChallenge };
}

function generateNonce() {
  const nonce = window.crypto.randomUUID();
  authentication.nonce.set(nonce);
  return { nonce };
}

async function generateOAuthAuthorizeEndpoint(
  returnTo: string,
  scope: string = '*'
) {
  // Generate and store the nonce and code challange for verifcation later
  const { nonce } = generateNonce();
  const { codeChallenge } = await generateCodeVerifierAndChallenge();

  const query = new URLSearchParams({
    client_id: getClientId(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: `${APP_ROOT}/oauth/callback?returnTo=${returnTo}`,
    response_type: 'code',
    scope,
    state: nonce,
  });

  return `${getLoginURL()}/oauth/authorize?${query.toString()}`;
}

export async function redirectToLogin(
  returnToPath: string,
  queryString: string = ''
) {
  const returnTo = `${returnToPath}${queryString}`;
  const authorizeUrl = await generateOAuthAuthorizeEndpoint(returnTo);
  window.location.assign(authorizeUrl);
}

export function revokeToken(clientId: string, token: string) {
  return fetch(`${getLoginURL()}/oauth/revoke`, {
    body: new URLSearchParams({ client_id: clientId, token }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    method: 'POST',
  });
}

export function clearStorageAndRedirectToLogout() {
  clearAllAuthDataFromLocalStorage();
  const loginUrl = getLoginURL();
  window.location.assign(loginUrl + '/logout');
}

export const OAuthCallbackParamsSchema = object({
  returnTo: string().default('/'),
  code: string().required(),
  state: string().required(), // aka "nonce"
});

export function getPKCETokenRequestFormData(
  code: string,
  nonce: string,
  codeVerifier: string
) {
  const formData = new FormData();
  formData.append('grant_type', 'authorization_code');
  formData.append('client_id', getClientId());
  formData.append('code', code);
  formData.append('state', nonce);
  formData.append('code_verifier', codeVerifier);
  return formData;
}

interface OAuthCallbackOptions {
  onSuccess: (returnTo: string) => void;
}

export async function handleOAuthCallback(options: OAuthCallbackOptions) {
  try {
    const {
      code,
      returnTo,
      state: nonce,
    } = OAuthCallbackParamsSchema.validateSync(
      getQueryParamsFromQueryString(location.search)
    );

    const expireDate = new Date();
    const codeVerifier = authentication.codeVerifier.get();

    if (!codeVerifier) {
      Sentry.captureException(
        'No code codeVerifier found in local storage when running OAuth callback.'
      );
      clearStorageAndRedirectToLogout();
      return;
    }

    authentication.codeVerifier.clear();

    /**
     * We need to validate that the nonce returned (comes from the location query param as the state param)
     * matches the one we stored when authentication was started. This confirms the initiator
     * and receiver are the same.
     * Nonce should be set and equal to ours otherwise retry auth
     */
    const storedNonce = authentication.nonce.get();

    if (!storedNonce) {
      Sentry.captureException(
        'No nonce found in local storage when running OAuth callback.'
      );
      clearStorageAndRedirectToLogout();
      return;
    }

    authentication.nonce.clear();

    if (storedNonce !== nonce) {
      Sentry.captureException(
        'Stored nonce is not the same nonce as the one sent by login. This may indicate an attack of some kind.'
      );
      clearStorageAndRedirectToLogout();
      return;
    }

    const formData = getPKCETokenRequestFormData(code, nonce, codeVerifier);

    try {
      const response = await fetch(`${getLoginURL()}/oauth/token`, {
        body: formData,
        method: 'POST',
      });

      if (response.ok) {
        const tokenParams = await response.json();

        /**
         * We multiply the expiration time by 1000 ms because JavaSript returns time in ms, while
         * the API returns the expiry time in seconds
         */
        expireDate.setTime(
          expireDate.getTime() + +tokenParams.expires_in * 1000
        );

        setAuthDataInLocalStorage({
          token: `${capitalize(tokenParams.token_type)} ${tokenParams.access_token}`,
          scopes: tokenParams.scopes,
          expires: expireDate.toString(),
        });

        options.onSuccess(returnTo);
      } else {
        Sentry.captureException("Request to /oauth/token was not 'ok'.", {
          extra: { statusCode: response.status },
        });
        clearStorageAndRedirectToLogout();
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: { message: 'Request to /oauth/token failed.' },
      });
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        message: 'Error when parsing search params on OAuth callback.',
      },
    });
    clearStorageAndRedirectToLogout();
  }
}
