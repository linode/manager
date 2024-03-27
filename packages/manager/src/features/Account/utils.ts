import { getStorage, setStorage } from 'src/utilities/storage';

import { ADMINISTRATOR, PARENT_USER } from './constants';

import type { GlobalGrantTypes, GrantLevel, Token } from '@linode/api-v4';
import type { GrantTypeMap } from 'src/features/Account/types';

export type ActionType =
  | 'clone'
  | 'create'
  | 'delete'
  | 'edit'
  | 'migrate'
  | 'modify'
  | 'reboot'
  | 'rebuild'
  | 'rescue'
  | 'resize'
  | 'view';

interface GetRestrictedResourceText {
  action?: ActionType;
  includeContactInfo?: boolean;
  isChildUser?: boolean;
  isSingular?: boolean;
  resourceType: GrantTypeMap;
}

interface AccountAccessGrant {
  globalGrantType: 'account_access';
  permittedGrantLevel: GrantLevel;
}

interface NonAccountAccessGrant {
  globalGrantType: Exclude<GlobalGrantTypes, 'account_access'>;
  permittedGrantLevel?: GrantLevel;
}

// Discriminating union to determine the type of global grant
export type RestrictedGlobalGrantType =
  | AccountAccessGrant
  | NonAccountAccessGrant;

/**
 * Get a resource restricted message based on action and resource type.
 */
export const getRestrictedResourceText = ({
  action = 'edit',
  includeContactInfo = true,
  isChildUser = false,
  isSingular = true,
  resourceType,
}: GetRestrictedResourceText): string => {
  const resource = isSingular
    ? 'this ' + resourceType.replace(/s$/, '')
    : resourceType;

  const contactPerson = isChildUser ? PARENT_USER : ADMINISTRATOR;

  let message = `You don't have permissions to ${action} ${resource}.`;

  if (includeContactInfo) {
    message += ` Please contact your ${contactPerson} to request the necessary permissions.`;
  }

  return message;
};

// TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
// ================================================================
// const mockExpiredTime =
//   'Mon Nov 20 2023 22:50:52 GMT-0800 (Pacific Standard Time)';
// ================================================================

/**
 * Determine whether the tokens used for switchable accounts are still valid.
 */
export const isParentTokenValid = (): boolean => {
  const now = new Date().toISOString();

  // From a proxy user, check whether parent token is still valid before switching.
  if (
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
export async function getPersonalAccessTokenForRevocation(
  tokens: Token[],
  currentTokenWithBearer: string
): Promise<Token | undefined> {
  return tokens.find(
    (token) =>
      token.token &&
      currentTokenWithBearer.replace('Bearer ', '').startsWith(token.token)
  );
}
