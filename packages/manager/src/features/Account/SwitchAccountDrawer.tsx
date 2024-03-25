import { createChildAccountPersonalAccessToken } from '@linode/api-v4';
import { useSnackbar } from 'notistack';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import {
  isParentTokenValid,
  setTokenInLocalStorage,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useRevokePersonalAccessTokenMutation } from 'src/queries/tokens';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics';
import { getStorage, setStorage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';

import type { Token } from '@linode/api-v4';
import type { APIError, ChildAccountPayload, UserType } from '@linode/api-v4';
import type { State as AuthState } from 'src/store/authentication';

interface Props {
  isProxyUser: boolean;
  onClose: () => void;
  open: boolean;
  proxyTokenId?: number;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { isProxyUser, onClose, open, proxyTokenId } = props;

  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [isProxyTokenError, setIsProxyTokenError] = React.useState<APIError[]>(
    []
  );

  const { mutateAsync: revokeToken } = useRevokePersonalAccessTokenMutation(
    proxyTokenId ?? -1
  );
  const { enqueueSnackbar } = useSnackbar();
  const currentTokenWithBearer = useCurrentToken() ?? '';

  const currentParentTokenWithBearer =
    getStorage('authentication/parent_token/token') ?? '';

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleProxyTokenRevocation = React.useCallback(async () => {
    try {
      await revokeToken();
      enqueueSnackbar(`Successfully revoked ${proxyTokenId}.`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar('Failed to revoke token.', {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, proxyTokenId, revokeToken]);

  const handleSwitchAccount = async ({
    currentTokenWithBearer,
    euuid,
    event,
    handleClose,
    isProxyUser,
  }: {
    currentTokenWithBearer?: AuthState['token'];
    euuid: string;
    event: React.MouseEvent<HTMLElement>;
    handleClose: (e: React.SyntheticEvent<HTMLElement>) => void;
    isProxyUser: boolean;
  }) => {
    if (isProxyUser) {
      await handleProxyTokenRevocation();
    }
    handleSwitchToChildAccount({
      currentTokenWithBearer,
      euuid,
      event,
      handleClose,
      isProxyUser,
    });
  };

  /**
   * Headers are required for proxy users when obtaining a proxy token.
   * For 'proxy' userType, use the stored parent token in the request.
   */
  const getProxyToken = React.useCallback(
    async ({
      euuid,
      token,
      userType,
    }: {
      euuid: ChildAccountPayload['euuid'];
      token: string;
      userType: Omit<UserType, 'child'>;
    }) => {
      try {
        return await createChildAccountPersonalAccessToken({
          euuid,
          headers:
            userType === 'proxy'
              ? {
                  Authorization: token,
                }
              : undefined,
        });
      } catch (error) {
        setIsProxyTokenError(error as APIError[]);
        throw error;
      }
    },
    []
  );

  const refreshPage = React.useCallback(() => {
    location.reload();
  }, []);

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      currentTokenWithBearer,
      euuid,
      event,
      handleClose,
      isProxyUser,
    }: {
      currentTokenWithBearer?: AuthState['token'];
      euuid: string;
      event: React.MouseEvent<HTMLElement>;
      handleClose: (e: React.SyntheticEvent<HTMLElement>) => void;
      isProxyUser: boolean;
    }) => {
      try {
        // We don't need to worry about this if we're a proxy user.
        if (!isProxyUser) {
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
        }

        const proxyToken = await getProxyToken({
          euuid,
          token: isProxyUser
            ? getStorage('authentication/parent_token/token')
            : currentTokenWithBearer,
          userType: isProxyUser ? 'proxy' : 'parent',
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

        handleClose(event);
        refreshPage();
      } catch (error) {
        setIsProxyTokenError(error as APIError[]);
      }
    },
    [getProxyToken, refreshPage]
  );

  const handleSwitchToParentAccount = React.useCallback(async () => {
    if (!isParentTokenValid()) {
      const expiredTokenError: APIError = {
        field: 'token',
        reason: PARENT_USER_SESSION_EXPIRED,
      };

      setIsParentTokenError([expiredTokenError]);

      return;
    }

    // Revoke proxy token before switching to parent account.
    await handleProxyTokenRevocation();

    updateCurrentTokenBasedOnUserType({ userType: 'parent' });

    // Reset flag for proxy user to display success toast once.
    setStorage('proxy_user', 'false');

    handleClose();
    refreshPage();
  }, [handleClose, handleProxyTokenRevocation, refreshPage]);

  return (
    <Drawer onClose={handleClose} open={open} title="Switch Account">
      {isProxyTokenError.length > 0 && (
        <Notice text={isProxyTokenError[0].reason} variant="error" />
      )}
      {isParentTokenError.length > 0 && (
        <Notice text={isParentTokenError[0].reason} variant="error" />
      )}
      <Typography
        sx={(theme) => ({
          margin: `${theme.spacing(3)} 0`,
        })}
      >
        Select an account to view and manage its settings and configurations
        {isProxyUser && (
          <>
            {' or '}
            <StyledLinkButton
              onClick={() => {
                sendSwitchToParentAccountEvent();
                handleSwitchToParentAccount();
              }}
              aria-label="parent-account-link"
            >
              switch back to your account
            </StyledLinkButton>
          </>
        )}
        .
      </Typography>
      <ChildAccountList
        currentTokenWithBearer={
          isProxyUser ? currentParentTokenWithBearer : currentTokenWithBearer
        }
        isProxyUser={isProxyUser}
        onClose={handleClose}
        onSwitchAccount={handleSwitchAccount}
      />
    </Drawer>
  );
};
