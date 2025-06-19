/* eslint-disable no-console */
import { capitalize, getQueryParamsFromQueryString } from '@linode/utilities';
import * as Sentry from '@sentry/react';

import {
  clearUserInput,
  getEnvLocalStorageOverrides,
  storage,
} from 'src/utilities/storage';

import { generateCodeChallenge, generateCodeVerifier } from './pkce';
import {
  LoginAsCustomerCallbackParamsSchema,
  OAuthCallbackParamsSchema,
} from './schemas';

import type {
  AuthCallbackOptions,
  TokenInfoToStore,
  TokenResponse,
} from './types';

export function setAuthDataInLocalStorage({
  scopes,
  token,
  expires,
}: TokenInfoToStore) {
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

function clearStorageAndRedirectToLogout() {
  clearAllAuthDataFromLocalStorage();
  const loginUrl = getLoginURL();
  window.location.assign(loginUrl + '/logout');
}

export function getIsLoggedInAsCustomer() {
  const token = storage.authentication.token.get();

  if (!token) {
    return false;
  }

  return token.toLowerCase().startsWith('admin');
}

function getLoginURL() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  return (
    localStorageOverrides?.loginRoot ?? import.meta.env.REACT_APP_LOGIN_ROOT
  );
}

function getClientId() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  const clientId =
    localStorageOverrides?.clientID ?? import.meta.env.REACT_APP_CLIENT_ID;

  if (!clientId) {
    throw new Error('No CLIENT_ID specified.');
  }

  return clientId;
}

function getAppRoot() {
  return import.meta.env.REACT_APP_APP_ROOT;
}

export async function logout() {
  const loginUrl = getLoginURL();
  const clientId = getClientId();
  const token = storage.authentication.token.get();

  clearUserInput();
  clearAuthDataFromLocalStorage();

  if (token) {
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
  storage.authentication.codeVerifier.set(codeVerifier);
  return { codeVerifier, codeChallenge };
}

function generateNonce() {
  const nonce = window.crypto.randomUUID();
  storage.authentication.nonce.set(nonce);
  return { nonce };
}

/**
 * Generates an authorization URL for purposes of authorizating with the Login server
 *
 * @param returnTo the path in Cloud Manager to return to
 * @returns a URL that we will redirect the user to in order to authenticate
 *
 * @example "https://login.fake.linode.com/oauth/authorize?client_id=9l424eefake9h4fead4d09&code_challenge=GDke2FgbFIlc1LICA5jXbUuvY1dThEDDtOI8roA17Io&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fcloud.fake.linode.com%2Foauth%2Fcallback%3FreturnTo%3D%2Flinodes&response_type=code&scope=*&state=99b64f1f-0174-4c7b-a3ab-d6807de5f524"
 */
export async function generateOAuthAuthorizeEndpoint(returnTo: string) {
  // Generate and store the nonce and code challenge for verification later
  const { nonce } = generateNonce();
  const { codeChallenge } = await generateCodeVerifierAndChallenge();

  const query = new URLSearchParams({
    client_id: getClientId(),
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    redirect_uri: `${getAppRoot()}/oauth/callback?returnTo=${returnTo}`,
    response_type: 'code',
    scope: '*',
    state: nonce,
  });

  return `${getLoginURL()}/oauth/authorize?${query.toString()}`;
}

export async function redirectToLogin() {
  // Retain the user's current path and search params so that login redirects
  // the user back to where they left off.
  const returnTo = `${window.location.pathname}${window.location.search}`;

  const authorizeUrl = await generateOAuthAuthorizeEndpoint(returnTo);

  window.location.assign(authorizeUrl);
}

function revokeToken(clientId: string, token: string) {
  return fetch(`${getLoginURL()}/oauth/revoke`, {
    body: new URLSearchParams({ client_id: clientId, token }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    method: 'POST',
  });
}

function getPKCETokenRequestFormData(
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

export async function handleOAuthCallback(options: AuthCallbackOptions) {
  try {
    const {
      code,
      returnTo,
      state: nonce,
    } = OAuthCallbackParamsSchema.validateSync(
      getQueryParamsFromQueryString(options.params)
    );

    const codeVerifier = storage.authentication.codeVerifier.get();

    if (!codeVerifier) {
      const error = new Error(
        'No code codeVerifier found in local storage when running OAuth callback.'
      );
      Sentry.captureException(error);
      clearStorageAndRedirectToLogout();
      throw error;
    }

    storage.authentication.codeVerifier.clear();

    const storedNonce = storage.authentication.nonce.get();

    if (!storedNonce) {
      const error = new Error(
        'No nonce found in local storage when running OAuth callback.'
      );
      Sentry.captureException(error);
      clearStorageAndRedirectToLogout();
      throw error;
    }

    storage.authentication.nonce.clear();

    /**
     * We need to validate that the nonce returned (comes from the location query param as the state param)
     * matches the one we stored when authentication was started. This confirms the initiator
     * and receiver are the same.
     */
    if (storedNonce !== nonce) {
      const error = new Error(
        'Stored nonce is not the same nonce as the one sent by login. This may indicate an attack of some kind.'
      );
      Sentry.captureException(error);
      clearStorageAndRedirectToLogout();
      throw error;
    }

    const formData = getPKCETokenRequestFormData(code, nonce, codeVerifier);

    const tokenCreatedAtDate = new Date();

    try {
      const response = await fetch(`${getLoginURL()}/oauth/token`, {
        body: formData,
        method: 'POST',
      });

      if (!response.ok) {
        const error = new Error('Request to /oauth/token was not ok.');
        Sentry.captureException(error, {
          extra: { statusCode: response.status },
        });
        clearStorageAndRedirectToLogout();
        throw error;
      }

      const tokenParams: TokenResponse = await response.json();

      // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
      const tokenExpiresAt =
        tokenCreatedAtDate.getTime() + tokenParams.expires_in * 1000;

      setAuthDataInLocalStorage({
        token: `${capitalize(tokenParams.token_type)} ${tokenParams.access_token}`,
        scopes: tokenParams.scopes,
        expires: String(tokenExpiresAt),
      });

      options.onSuccess?.({
        returnTo,
        expiresIn: tokenParams.expires_in,
      });
    } catch (error) {
      Sentry.captureException(error, {
        extra: { message: 'Request to /oauth/token failed.' },
      });
      clearStorageAndRedirectToLogout();
      throw error;
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        message: 'Error parsing search params on OAuth callback.',
      },
    });
    clearStorageAndRedirectToLogout();
    throw error;
  }
}

export function handleLoginAsCustomerCallback(options: AuthCallbackOptions) {
  try {
    const {
      access_token: accessToken,
      destination,
      expires_in: expiresIn,
      token_type: tokenType,
    } = LoginAsCustomerCallbackParamsSchema.validateSync(
      getQueryParamsFromQueryString(options.params)
    );

    // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
    const tokenExpiresAt = Date.now() + expiresIn * 1000;

    /**
     * We have all the information we need and can persist it to localStorage
     */
    setAuthDataInLocalStorage({
      token: `${capitalize(tokenType)} ${accessToken}`,
      scopes: '*',
      expires: String(tokenExpiresAt),
    });

    /**
     * All done, redirect to the destination from the hash params
     * NOTE: The destination does not include a leading slash
     */
    options.onSuccess?.({
      returnTo: `/${destination}`,
      expiresIn,
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        message:
          'Unable to login as customer. Admin did not send expected params in location hash.',
      },
    });
    throw error;
  }
}
