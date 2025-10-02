import {
  deletePersonalAccessToken,
  getPersonalAccessTokens,
} from '@linode/api-v4';
import {
  useCreateChildAccountPersonalAccessTokenMutation,
  useGenerateChildAccountTokenQuery,
} from '@linode/queries';
import { useCallback } from 'react';
import React from 'react';

import {
  getPersonalAccessTokenForRevocation,
  isParentTokenValid,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/SwitchAccounts/utils';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { getStorage, storage } from 'src/utilities/storage';

import type { Token, UserType } from '@linode/api-v4';

export const useParentChildAuthentication = () => {
  const currentTokenWithBearer = storage.authentication.token.get() ?? '';
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

  const {
    error: createTokenError,
    isPending: createTokenLoading,
    mutateAsync: createProxyToken,
  } = useCreateChildAccountPersonalAccessTokenMutation();

  const {
    error: generateTokenError,
    isPending: generateTokenLoading,
    mutateAsync: generateProxyToken,
  } = useGenerateChildAccountTokenQuery();

  const error = React.useMemo(
    () => (isIAMDelegationEnabled ? generateTokenError : createTokenError),
    [isIAMDelegationEnabled, createTokenError, generateTokenError]
  );

  const loading = React.useMemo(
    () => (isIAMDelegationEnabled ? generateTokenLoading : createTokenLoading),
    [isIAMDelegationEnabled, createTokenLoading, generateTokenLoading]
  );

  const createToken = useCallback(
    async (euuid: string): Promise<Token> => {
      return isIAMDelegationEnabled
        ? generateProxyToken({ euuid })
        : createProxyToken({
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
    [createProxyToken, generateProxyToken, isIAMDelegationEnabled]
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
    error,
    loading,
    revokeToken,
    updateCurrentToken,
    validateParentToken,
  };
};
