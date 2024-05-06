import { getStorage, setStorage } from 'src/utilities/storage';

import type { Token, UserType } from '@linode/api-v4';
import type { State as AuthState } from 'src/store/authentication';

export interface ProxyTokenCreationParams {
  /**
   * The euuid of the child account for which the token is being created.
   */
  euuid: string;
  /**
   * The parent token used to create the proxy token (includes 'Bearer' prefix).
   */
  token: string;
  /**
   * The userType of the child account.
   */
  userType: Omit<UserType, 'child' | 'default'>;
}

export const updateParentTokenInLocalStorage = ({
  currentTokenWithBearer,
}: {
  currentTokenWithBearer?: AuthState['token'];
}) => {
  const parentToken: Token = {
    created: getStorage('authentication/created'),
    expiry: getStorage('authentication/expire'),
    id: getStorage('authentication/id'),
    label: getStorage('authentication/label'),
    scopes: getStorage('authentication/scopes'),
    token: currentTokenWithBearer ?? '',
  };

  setTokenInLocalStorage({
    prefix: 'authentication/parent_token',
    token: parentToken,
  });
};

/**
 * Determine whether the tokens used for switchable accounts are still valid.
 */
export const isParentTokenValid = (): boolean => {
  const now = new Date().toISOString();

  // From a proxy user, check whether parent token is still valid before switching.
  if (
    now >
    new Date(getStorage('authentication/parent_token/expire')).toISOString()
  ) {
    return false;
  }
  return true;
};

/**
 * Set token information in the local storage.
 * This allows us to store a token for later use, such as switching between parent and proxy accounts.
 */
export const setTokenInLocalStorage = ({
  prefix,
  token = { expiry: '', scopes: '', token: '' },
}: {
  prefix: string;
  token?: Pick<Token, 'expiry' | 'scopes' | 'token'>;
}) => {
  const { expiry, scopes, token: tokenValue } = token;

  if (!tokenValue || !expiry) {
    return;
  }

  setStorage(`${prefix}/token`, tokenValue);
  setStorage(`${prefix}/expire`, expiry);
  setStorage(`${prefix}/scopes`, scopes);
};

/**
 * Set the active token in the local storage.
 */
export const updateCurrentTokenBasedOnUserType = ({
  userType,
}: {
  userType: 'parent' | 'proxy';
}) => {
  const storageKeyPrefix = `authentication/${userType}_token`;

  const userToken = getStorage(`${storageKeyPrefix}/token`);
  const userScope = getStorage(`${storageKeyPrefix}/scopes`);
  const userExpiry = getStorage(`${storageKeyPrefix}/expire`);

  if (userToken) {
    setStorage('authentication/token', userToken);
    setStorage('authentication/scopes', userScope);
    setStorage('authentication/expire', userExpiry);
  }
};

/**
 * Finds a personal access token stored locally for revocation,
 * typically used when switching between accounts. Searching local storage
 * for the token is necessary because the token is not persisted in state.
 */
export function getPersonalAccessTokenForRevocation(
  tokens: Token[] | undefined,
  currentTokenWithBearer: string
): Token | undefined {
  if (!tokens) {
    return;
  }
  return tokens.find(
    (token) =>
      token.token &&
      currentTokenWithBearer.replace('Bearer ', '').startsWith(token.token)
  );
}
