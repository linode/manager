/* eslint-disable no-console */
import { CLIENT_ID, LOGIN_ROOT } from 'src/constants';
import { revokeToken } from 'src/session';
import {
  clearUserInput,
  getEnvLocalStorageOverrides,
  storage,
} from 'src/utilities/storage';

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

export function clearNonceAndCodeVerifierFromLocalStorage() {
  storage.authentication.nonce.clear();
  storage.authentication.codeVerifier.clear();
}

export function getIsLoggedInAsCustomer() {
  const token = storage.authentication.token.get();

  if (!token) {
    return false;
  }

  return token.toLowerCase().includes('admin');
}

function getSafeLoginURL() {
  const localStorageOverrides = getEnvLocalStorageOverrides();

  let loginUrl = LOGIN_ROOT;

  if (localStorageOverrides?.loginRoot) {
    try {
      loginUrl = new URL(localStorageOverrides.loginRoot).toString();
    } catch (error) {
      console.error('The currently selected Login URL is invalid.', error);
    }
  }

  return loginUrl;
}

export async function logout() {
  const localStorageOverrides = getEnvLocalStorageOverrides();
  const loginUrl = getSafeLoginURL();
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
