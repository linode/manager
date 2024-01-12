import { getStorage, setStorage } from 'src/utilities/storage';

import type { Token } from '@linode/api-v4';

// TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
// ================================================================
// const mockExpiredTime =
//   'Mon Nov 20 2023 22:50:52 GMT-0800 (Pacific Standard Time)';
// ================================================================

/**
 * Determine whether the tokens used for switchable accounts are still valid.
 */
export const isParentTokenValid = ({
  isProxyUser,
}: {
  isProxyUser: boolean;
}) => {
  const now = new Date().toISOString();

  // From a proxy user, check whether parent token is still valid before switching.
  if (
    isProxyUser &&
    now >
      new Date(getStorage('authentication/parent_token/expire')).toISOString()

    // TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
    // ================================================================
    // new Date(mockExpiredTime).toISOString()
    // ================================================================
  ) {
    return false;
  }
  return true;
};

/**
 * Set token information in the local storage.
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
export const setActiveTokenInLocalStorage = ({
  userType,
}: {
  userType: 'parent' | 'proxy';
}) => {
  const storageKeyPrefix = `authentication/${userType}_token`;

  const activeToken = getStorage(`${storageKeyPrefix}/token`, false);
  const activeScope = getStorage(`${storageKeyPrefix}/scopes`, false);
  const activeExpiry = getStorage(`${storageKeyPrefix}/expire`, false);

  if (activeToken) {
    setStorage('authentication/token', activeToken);
    setStorage('authentication/scopes', activeScope);
    setStorage('authentication/expire', activeExpiry);
  }
};
