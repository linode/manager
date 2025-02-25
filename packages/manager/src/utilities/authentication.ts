import { authentication } from './storage';

/**
 * The AuthCode is generated and used during the PKCE Authentication flow
 */
export interface AuthCode {
  codeVerifier: string;
  nonce: string;
}

export const getAuthCode = (): AuthCode => ({
  codeVerifier: authentication.codeVerifier.get(),
  nonce: authentication.nonce.get(),
});

export const setAuthCode = ({ codeVerifier, nonce }: AuthCode) => {
  authentication.codeVerifier.set(codeVerifier);
  authentication.nonce.set(nonce);
};

export const clearAuthCode = () => setAuthCode({ codeVerifier: '', nonce: '' });

/**
 * `AuthToken` is retrieved after authentication is complete and is stored
 * for the duration of the session.
 */
export interface AuthToken {
  expiration: string;
  scopes: string;
  token: string;
}

export const getAuthToken = (): AuthToken => ({
  expiration: authentication.expire.get(),
  scopes: authentication.scopes.get(),
  token: authentication.token.get(),
});

export const setAuthToken = ({ expiration, scopes, token }: AuthToken) => {
  authentication.expire.set(expiration);
  authentication.scopes.set(scopes);
  authentication.token.set(token);
};

export const clearAuthToken = () =>
  setAuthToken({ expiration: '', scopes: '', token: '' });

export const isLoggedIn = () => !!getAuthToken().token;

export const isLoggedInAsCustomer = () =>
  getAuthToken().token.toLowerCase().includes('admin');
