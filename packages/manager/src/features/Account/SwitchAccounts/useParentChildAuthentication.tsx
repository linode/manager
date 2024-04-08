import { useCallback } from 'react';

import {
  isParentTokenValid,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/SwitchAccounts/utils';
import { useCreateChildAccountPersonalAccessTokenMutation } from 'src/queries/account/account';
import { useRevokePersonalAccessTokenMutation } from 'src/queries/tokens';
import { getStorage } from 'src/utilities/storage';

import type { Token, UserType } from '@linode/api-v4';

interface useAuthenticationProps {
  tokenIdToRevoke: number;
}

export const useParentChildAuthentication = ({
  tokenIdToRevoke,
}: useAuthenticationProps) => {
  const {
    error: revokeTokenError,
    isLoading: revokeTokenLoading,
    mutateAsync: revokeAccessToken,
  } = useRevokePersonalAccessTokenMutation(tokenIdToRevoke);

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

  const revokeToken = useCallback(async (): Promise<{}> => {
    return revokeAccessToken();
  }, [revokeAccessToken]);

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
    revokeTokenError,
    revokeTokenLoading,
    updateCurrentToken,
    validateParentToken,
  };
};
