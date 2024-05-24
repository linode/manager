import {
  deletePersonalAccessToken,
  getPersonalAccessTokens,
} from '@linode/api-v4';
import { useCallback } from 'react';

import { getPersonalAccessTokenForRevocation } from 'src/features/Account/SwitchAccounts/utils';
import {
  isParentTokenValid,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/SwitchAccounts/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useCreateChildAccountPersonalAccessTokenMutation } from 'src/queries/account/account';
import { getStorage } from 'src/utilities/storage';

import type { Token, UserType } from '@linode/api-v4';

export const useParentChildAuthentication = () => {
  const currentTokenWithBearer = useCurrentToken() ?? '';

  const {
    error: createTokenError,
    isLoading: createTokenLoading,
    mutateAsync: createProxyToken,
  } = useCreateChildAccountPersonalAccessTokenMutation();

  const createToken = useCallback(
    async (euuid: string): Promise<Token> => {
      return createProxyToken({
        euuid,
        headers: {
          /**
           * Headers are required for proxy users when obtaining a proxy token.
           * For 'proxy' userType, use the stored parent token in the request.
           */
          Authorization: getStorage('authentication/parent_token/token'),
        },
      });
    },
    [createProxyToken]
  );

  const revokeToken = useCallback(async (): Promise<void> => {
    const tokens = await getPersonalAccessTokens();

    // No tokens available for revocation.
    if (!tokens?.data?.length) {
      return;
    }

    const pendingRevocationToken = getPersonalAccessTokenForRevocation(
      tokens.data,
      currentTokenWithBearer
    );

    if (pendingRevocationToken) {
      await deletePersonalAccessToken(pendingRevocationToken.id);
    }
  }, [currentTokenWithBearer]);

  const updateCurrentToken = useCallback(
    ({ userType }: { userType: Extract<UserType, 'parent' | 'proxy'> }) => {
      updateCurrentTokenBasedOnUserType({ userType });
    },
    []
  );

  const validateParentToken = useCallback(() => {
    return isParentTokenValid();
  }, []);

  return {
    createToken,
    createTokenError,
    createTokenLoading,
    revokeToken,
    updateCurrentToken,
    validateParentToken,
  };
};
