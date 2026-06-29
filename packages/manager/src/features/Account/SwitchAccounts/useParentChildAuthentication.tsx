import { getStorage } from '@akamai/compute-ui-core/browser';
import {
  deletePersonalAccessToken,
  getPersonalAccessTokens,
} from '@linode/api-v4';
import { useGenerateChildAccountTokenQuery } from '@linode/queries';
import { useCallback } from 'react';
import React from 'react';

import {
  getPersonalAccessTokenForRevocation,
  isParentTokenValid,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/SwitchAccounts/utils';
import { storage } from 'src/utilities/storage';

import type { Token, UserType } from '@linode/api-v4';

export const useParentChildAuthentication = () => {
  const currentTokenWithBearer = storage.authentication.token.get() ?? '';

  const {
    error: generateTokenError,
    isPending: generateTokenLoading,
    mutateAsync: generateDelegateToken,
  } = useGenerateChildAccountTokenQuery();

  const error = React.useMemo(() => generateTokenError, [generateTokenError]);

  const loading = React.useMemo(
    () => generateTokenLoading,
    [generateTokenLoading]
  );

  const createToken = useCallback(
    async (euuid: string): Promise<Token> => {
      const tokenParent = getStorage('authentication/parent_token/token');

      return generateDelegateToken({
        euuid,
        headers: {
          /**
           * Headers are required for delegate users when obtaining a delegate token.
           * For 'delegate' userType, use the stored parent token in the request.
           */
          Authorization: tokenParent,
        },
      });
    },
    [generateDelegateToken]
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
    ({ userType }: { userType: Extract<UserType, 'delegate' | 'parent'> }) => {
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
