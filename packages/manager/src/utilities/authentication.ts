import { authentication } from './storage';

export interface AuthToken {
  expiration: string;
  scopes: string;
  token: string;
}

/**
 * Retrieve the authentication token from local storage.
 */
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

export const loggedInAsCustomer = () =>
  getAuthToken().token.toLowerCase().includes('admin');
