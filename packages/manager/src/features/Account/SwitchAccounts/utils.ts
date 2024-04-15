import { createChildAccountPersonalAccessToken } from '@linode/api-v4';

import {
  setTokenInLocalStorage,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/utils';
import { getStorage } from 'src/utilities/storage';

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
 * Headers are required for proxy users when obtaining a proxy token.
 * For 'proxy' userType, use the stored parent token in the request.
 */
export const updateProxyTokenInLocalStorage = async ({
  euuid,
  token,
  userType,
}: ProxyTokenCreationParams) => {
  const proxyToken = await createChildAccountPersonalAccessToken({
    euuid,
    headers:
      userType === 'proxy'
        ? {
            Authorization: token,
          }
        : undefined,
  });

  setTokenInLocalStorage({
    prefix: 'authentication/proxy_token',
    token: {
      ...proxyToken,
      token: `Bearer ${proxyToken.token}`,
    },
  });

  updateCurrentTokenBasedOnUserType({
    userType: 'proxy',
  });
};
