import { useLocation } from 'react-router-dom';

import { redirectToLogin } from 'src/session';
import { storage } from 'src/utilities/storage';

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
   * @example "*"
   */
  scopes: string;
  /**
   * The token including the "Bearer" prefix
   * @example "Bearer 12345"
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
