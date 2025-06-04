import { useLocation } from 'react-router-dom';

import { redirectToLogin } from 'src/session';

export const TOKEN = 'authentication/token';
const NONCE = 'authentication/nonce';
const CODE_VERIFIER = 'authentication/code-verifier';
export const SCOPES = 'authentication/scopes';
export const EXPIRE = 'authentication/expire';

interface TokensWithExpiry {
  expires: string;
  scopes: string;
  token: string;
}

export function setAuthDataInLocalStorage({
  scopes,
  token,
  expires,
}: TokensWithExpiry) {
  localStorage.setItem(SCOPES, scopes);
  localStorage.setItem(TOKEN, token);
  localStorage.setItem(EXPIRE, expires);
}

export const clearAuthDataFromLocalStorage = () => {
  localStorage.removeItem(TOKEN);
  localStorage.removeItem(SCOPES);
  localStorage.removeItem(EXPIRE);
};

export const clearNonceAndCodeVerifierFromLocalStorage = () => {
  localStorage.removeItem(NONCE);
  localStorage.removeItem(CODE_VERIFIER);
};

export function getIsLoggedInAsCustomer() {
  const token = localStorage.getItem(TOKEN);

  if (!token) {
    return false;
  }

  return token.toLowerCase().includes('admin');
}

export function useOAuth() {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN);

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
