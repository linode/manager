import {
  capitalize,
  getQueryParamsFromQueryString,
  tryCatch,
} from '@linode/utilities';
import * as Sentry from '@sentry/react';

import { clearUserInput, storage } from 'src/utilities/storage';

import { getAppRoot, getClientId, getLoginURL } from './constants';
import { generateCodeChallenge, generateCodeVerifier } from './pkce';
import {
  LoginAsCustomerCallbackParamsSchema,
  OAuthCallbackParamsSchema,
} from './schemas';
import { AuthenticationError } from './types';

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

export function clearStorageAndRedirectToLogout() {
  clearAllAuthDataFromLocalStorage();
  const loginUrl = getLoginURL();
  window.location.assign(loginUrl + '/logout');
}

export function getIsAdminToken(token: string) {
  return token.toLowerCase().startsWith('admin');
}

export function getIsLoggedInAsCustomer() {
  const token = storage.authentication.token.get();

  if (!token) {
    return false;
  }

  return getIsAdminToken(token);
}

async function generateCodeVerifierAndChallenge() {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  storage.authentication.codeVerifier.set(codeVerifier);
  return { codeVerifier, codeChallenge };
}

function generateNonce() {
  if (!window.crypto?.randomUUID) {
    throw new Error('Crypto API not available');
  }

  const nonce = window.crypto.randomUUID();
  storage.authentication.nonce.set(nonce);
  return { nonce };
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

/**
 * Attempts to revoke the user's current token, then redirects the user to the
 * "logout" page of the Login server (https://login.linode.com/logout).
 */
export async function logout() {
  const loginUrl = getLoginURL();
  const clientId = getClientId();
  const token = storage.authentication.token.get();

  clearUserInput();
  clearAuthDataFromLocalStorage();

  if (token) {
    const tokenWithoutPrefix = token.split(' ')[1];

    try {
      const response = await fetch(`${getLoginURL()}/oauth/revoke`, {
        body: new URLSearchParams({
          client_id: clientId,
          token: tokenWithoutPrefix,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        method: 'POST',
      });

      if (!response.ok) {
        const error = new AuthenticationError(
          'Request to POST /oauth/revoke was not ok.'
        );
        Sentry.captureException(error, {
          extra: { statusCode: response.status },
        });
      }
    } catch (fetchError) {
      const error = new AuthenticationError(
        `Unable to revoke OAuth token because POST /oauth/revoke failed.`,
        fetchError
      );
      Sentry.captureException(error);
    }
  }

  window.location.assign(`${loginUrl}/logout`);
}

/**
 * Generates an authorization URL for purposes of authorizating with the Login server
 *
 * @param returnTo the path in Cloud Manager to return to
 * @returns a URL that we will redirect the user to in order to authenticate, or null if crypto API unavailable
 * @example "https://login.fake.linode.com/oauth/authorize?client_id=9l424eefake9h4fead4d09&code_challenge=GDke2FgbFIlc1LICA5jXbUuvY1dThEDDtOI8roA17Io&code_challenge_method=S256&redirect_uri=https%3A%2F%2Fcloud.fake.linode.com%2Foauth%2Fcallback%3FreturnTo%3D%2Flinodes&response_type=code&scope=*&state=99b64f1f-0174-4c7b-a3ab-d6807de5f524"
 */
export async function generateOAuthAuthorizeEndpoint(returnTo: string) {
  // Generate and store the nonce and code challenge for verification later
  let nonce;
  try {
    const { nonce: generatedNonce } = generateNonce();
    nonce = generatedNonce;
  } catch {
    // Intentionally ignoring crypto API errors
    // eslint-disable-next-line sonarjs/no-ignored-exceptions
    return null;
  }

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

/**
 * Generates prerequisite data needed for authentication then redirects the user to the login server to authenticate.
 */
export async function redirectToLogin() {
  // Retain the user's current path and search params so that login redirects
  // the user back to where they left off.
  const returnTo = `${window.location.pathname}${window.location.search}`;

  const authorizeUrl = await generateOAuthAuthorizeEndpoint(returnTo);

  if (!authorizeUrl) {
    return; //  Exit early if secure authentication is not available, i.e. no Crypto API
  }

  window.location.assign(authorizeUrl);
}

/**
 * Handles an OAuth callback to a URL like:
 * https://cloud.linode.com/oauth/callback?returnTo=%2F&state=066a6ad9-b19a-43bb-b99a-ef0b5d4fc58d&code=42ddf75dfa2cacbad897
 *
 * @throws {AuthenticationError} if anything went wrong when starting session
 * @returns Some information about the new session because authentication was successfull
 */
export async function handleOAuthCallback(options: AuthCallbackOptions) {
  const { data: params, error: parseParamsError } = await tryCatch(
    OAuthCallbackParamsSchema.validate(
      getQueryParamsFromQueryString(options.params)
    )
  );

  if (parseParamsError) {
    throw new AuthenticationError(
      'Error parsing search params on OAuth callback.',
      parseParamsError
    );
  }

  const codeVerifier = storage.authentication.codeVerifier.get();

  if (!codeVerifier) {
    throw new AuthenticationError(
      'No code codeVerifier found in local storage when running OAuth callback.'
    );
  }

  storage.authentication.codeVerifier.clear();

  const storedNonce = storage.authentication.nonce.get();

  if (!storedNonce) {
    throw new AuthenticationError(
      'No nonce found in local storage when running OAuth callback.'
    );
  }

  storage.authentication.nonce.clear();

  /**
   * We need to validate that the nonce returned (comes from the location query param as the state param)
   * matches the one we stored when authentication was started. This confirms the initiator
   * and receiver are the same.
   */
  if (storedNonce !== params.state) {
    throw new AuthenticationError(
      'Stored nonce is not the same nonce as the one sent by login.'
    );
  }

  const formData = getPKCETokenRequestFormData(
    params.code,
    params.state,
    codeVerifier
  );

  const tokenCreatedAtDate = new Date();

  const { data: response, error: tokenError } = await tryCatch(
    fetch(`${getLoginURL()}/oauth/token`, {
      body: formData,
      method: 'POST',
    })
  );

  if (tokenError) {
    throw new AuthenticationError(
      'Request to POST /oauth/token failed.',
      tokenError
    );
  }

  if (!response.ok) {
    Sentry.setExtra('status_code', response.status);
    throw new AuthenticationError('Request to POST /oauth/token was not ok.');
  }

  const { data: tokenParams, error: parseJSONError } =
    await tryCatch<TokenResponse>(response.json());

  if (parseJSONError) {
    throw new AuthenticationError(
      'Unable to parse the response of POST /oauth/token as JSON.',
      parseJSONError
    );
  }

  // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
  const tokenExpiresAt =
    tokenCreatedAtDate.getTime() + tokenParams.expires_in * 1000;

  setAuthDataInLocalStorage({
    token: `${capitalize(tokenParams.token_type)} ${tokenParams.access_token}`,
    scopes: tokenParams.scopes,
    expires: String(tokenExpiresAt),
  });

  return {
    returnTo: params.returnTo,
    expiresIn: tokenParams.expires_in,
  };
}

/**
 * Handles a "Login as Customer" callback to a URL like:
 * https://cloud.linode.com/admin/callback#access_token=fjhwehkfg&destination=dashboard&expires_in=900&token_type=Admin
 *
 * @throws {AuthenticationError} if anything went wrong when starting session
 * @returns Some information about the new session because authentication was successfull
 */
export async function handleLoginAsCustomerCallback(
  options: AuthCallbackOptions
) {
  const { data: params, error } = await tryCatch(
    LoginAsCustomerCallbackParamsSchema.validate(
      getQueryParamsFromQueryString(options.params)
    )
  );

  if (error) {
    throw new AuthenticationError(
      'Unable to login as customer. Admin did not send expected params in location hash.'
    );
  }

  // We multiply the expiration time by 1000 because JS returns time in ms, while OAuth expresses the expiry time in seconds
  const tokenExpiresAt = Date.now() + params.expires_in * 1000;

  /**
   * We have all the information we need and can persist it to localStorage
   */
  setAuthDataInLocalStorage({
    token: `${capitalize(params.token_type)} ${params.access_token}`,
    scopes: '*',
    expires: String(tokenExpiresAt),
  });

  return {
    returnTo: `/${params.destination}`, // The destination from admin does not include a leading slash
    expiresIn: params.expires_in,
  };
}
