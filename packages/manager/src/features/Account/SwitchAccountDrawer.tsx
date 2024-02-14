import { createChildAccountPersonalAccessToken } from '@linode/api-v4';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { PARENT_SESSION_EXPIRED } from 'src/features/Account/constants';
import {
  isParentTokenValid,
  setTokenInLocalStorage,
  updateCurrentTokenBasedOnUserType,
} from 'src/features/Account/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { getStorage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';

import type { APIError, ChildAccountPayload, UserType } from '@linode/api-v4';
import type { State as AuthState } from 'src/store/authentication';

interface Props {
  isProxyUser: boolean;
  onClose: () => void;
  open: boolean;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { isProxyUser, onClose, open } = props;

  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [isProxyTokenError, setIsProxyTokenError] = React.useState<APIError[]>(
    []
  );

  const currentTokenWithBearer = useCurrentToken() ?? '';
  const history = useHistory();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

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

  // Navigate to the current location, triggering a re-render without a full page reload.
  const refreshPage = React.useCallback(() => {
    // TODO: Parent/Child: We need to test this against the real API.
    history.push(history.location.pathname);
  }, [history]);

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
        // TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
        // ================================================================
        // throw new Error(
        //   `Account switching failed. Try again.`
        // );
        // ================================================================

        // We don't need to worry about this if we're a proxy user.
        if (!isProxyUser) {
          const parentToken = {
            expiry: getStorage('authentication/expire'),
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
          token: proxyToken,
        });

        updateCurrentTokenBasedOnUserType({
          userType: 'proxy',
        });

        handleClose(event);
        refreshPage();
      } catch (error) {
        setIsProxyTokenError(error as APIError[]);

        // TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
        // ================================================================
        // setIsProxyTokenError([
        //   {
        //     field: 'token',
        //     reason: error.message,
        //   },
        // ]);
        // ================================================================
      }
    },
    [getProxyToken, refreshPage]
  );

  const handleSwitchToParentAccount = React.useCallback(() => {
    if (!isParentTokenValid()) {
      const expiredTokenError: APIError = {
        field: 'token',
        reason: PARENT_SESSION_EXPIRED,
      };

      setIsParentTokenError([expiredTokenError]);

      return;
    }

    updateCurrentTokenBasedOnUserType({ userType: 'parent' });
    handleClose();
  }, [handleClose, isProxyUser]);

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
              aria-label="parent-account-link"
              onClick={handleSwitchToParentAccount}
            >
              switch back to your account
            </StyledLinkButton>
          </>
        )}
        .
      </Typography>
      <ChildAccountList
        currentTokenWithBearer={currentTokenWithBearer}
        isProxyUser={isProxyUser}
        onClose={handleClose}
        onSwitchAccount={handleSwitchToChildAccount}
      />
    </Drawer>
  );
};
