import { useSnackbar } from 'notistack';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import {
  isParentTokenValid,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useRevokePersonalAccessTokenMutation } from 'src/queries/tokens';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics';
import { getStorage, setStorage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';
import {
  updateParentTokenInLocalStorage,
  updateProxyTokenInLocalStorage,
} from './SwitchAccounts/utils';

import type { APIError, Token, UserType } from '@linode/api-v4';
import type { State as AuthState } from 'src/store/authentication';

interface Props {
  onClose: () => void;
  open: boolean;
  proxyToken?: Token;
  userType: UserType | undefined;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { onClose, open, proxyToken, userType } = props;
  const proxyTokenLabel = proxyToken?.label;
  const isProxyUser = userType === 'proxy';

  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [isProxyTokenError, setIsProxyTokenError] = React.useState<APIError[]>(
    []
  );

  const { mutateAsync: revokeToken } = useRevokePersonalAccessTokenMutation(
    proxyToken?.id ?? -1
  );
  const { enqueueSnackbar } = useSnackbar();
  const currentTokenWithBearer = useCurrentToken() ?? '';

  const currentParentTokenWithBearer =
    getStorage('authentication/parent_token/token') ?? '';

  const handleProxyTokenRevocation = React.useCallback(async () => {
    try {
      await revokeToken();
      enqueueSnackbar(`Successfully revoked ${proxyTokenLabel}.`, {
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(`Failed to revoke ${proxyTokenLabel}.`, {
        variant: 'error',
      });
    }
  }, [enqueueSnackbar, proxyTokenLabel, revokeToken]);

  const refreshPage = React.useCallback(() => {
    location.reload();
  }, []);

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      currentTokenWithBearer,
      euuid,
      event,
      onClose,
      userType,
    }: {
      currentTokenWithBearer?: AuthState['token'];
      euuid: string;
      event: React.MouseEvent<HTMLElement>;
      onClose: (e: React.SyntheticEvent<HTMLElement>) => void;
      userType: UserType | undefined;
    }) => {
      const isProxyUser = userType === 'proxy';

      if (isProxyUser) {
        // Revoke proxy token before switching accounts.
        await handleProxyTokenRevocation();
      } else {
        // Before switching to a child account, update the parent token in local storage.
        updateParentTokenInLocalStorage({ currentTokenWithBearer });
      }

      try {
        await updateProxyTokenInLocalStorage({
          euuid,
          token: isProxyUser
            ? getStorage('authentication/parent_token/token')
            : currentTokenWithBearer,
          userType: isProxyUser ? 'proxy' : 'parent',
        });
      } catch (error) {
        setIsProxyTokenError(error);
        throw error;
      }

      onClose(event);
      refreshPage();
    },
    [handleProxyTokenRevocation, refreshPage]
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

    onClose();
    refreshPage();
  }, [onClose, handleProxyTokenRevocation, refreshPage]);

  return (
    <Drawer onClose={onClose} open={open} title="Switch Account">
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
        onClose={onClose}
        onSwitchAccount={handleSwitchToChildAccount}
        userType={userType}
      />
    </Drawer>
  );
};
