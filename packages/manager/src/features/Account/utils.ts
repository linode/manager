import { getStorage, setStorage } from 'src/utilities/storage';

import type {
  GlobalGrantTypes,
  GrantLevel,
  Grants,
  Profile,
  Token,
} from '@linode/api-v4';
import type { GrantTypeMap } from 'src/features/Account/types';

type ActionType = 'create' | 'delete' | 'edit' | 'view';

interface GetRestrictedResourceText {
  action?: ActionType;
  isSingular?: boolean;
  resourceType: GrantTypeMap;
}

export type isRestrictedGlobalGrantType =
  | {
      globalGrantType: 'account_access';
      grants: Grants | undefined;
      permittedGrantLevel: GrantLevel;
      profile: Profile | undefined;
    }
  | {
      globalGrantType: Exclude<GlobalGrantTypes, 'account_access'>;
      grants: Grants | undefined;
      permittedGrantLevel?: GrantLevel;
      profile: Profile | undefined;
    };

export const getRestrictedResourceText = ({
  action = 'edit',
  isSingular = true,
  resourceType,
}: GetRestrictedResourceText): string => {
  const resource = isSingular
    ? 'this ' + resourceType.replace(/s$/, '')
    : resourceType;

  return `You don't have permissions to ${action} ${resource}. Please contact your account administrator to request the necessary permissions.`;
};

/**
 * Determine whether the user has restricted access to a specific resource.
 *
 * @example
 * // If account access does not equal 'read_write', the user has restricted access.
 * isRestrictedGlobalGrantType({
 *   globalGrantType: 'account_access',
 *   allowableGrantLevel: 'read_write',
 *   grants,
 *   profile
 * });
 * // Returns: true
 */
export const isRestrictedGlobalGrantType = ({
  globalGrantType,
  grants,
  permittedGrantLevel,
  profile,
}: isRestrictedGlobalGrantType): boolean => {
  if (globalGrantType !== 'account_access') {
    return Boolean(profile?.restricted) && !grants?.global[globalGrantType];
  }

  return (
    Boolean(profile?.restricted) &&
    grants?.global[globalGrantType] !== permittedGrantLevel
  );
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
