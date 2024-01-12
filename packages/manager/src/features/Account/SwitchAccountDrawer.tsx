import { createChildAccountPersonalAccessToken } from '@linode/api-v4';
import { RequestHeaders } from '@linode/api-v4/src/types';
import { useSnackbar } from 'notistack';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import {
  isParentTokenValid,
  setActiveTokenInLocalStorage,
  setTokenInLocalStorage,
} from 'src/features/Account/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { useFlags } from 'src/hooks/useFlags';
import { storage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';

import type { APIError, ChildAccountPayload } from '@linode/api-v4';
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

  const flags = useFlags();
  const currentBearerToken = useCurrentToken() ?? '';
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  // From proxy accounts, make a request on behalf of the parent account to fetch child accounts.
  const headers =
    flags.parentChildAccountAccess && isProxyUser
      ? {
          Authorization: `Bearer ${currentBearerToken}`,
        }
      : undefined;

  const getProxyToken = async ({ euuid, headers }: ChildAccountPayload) => {
    try {
      return await createChildAccountPersonalAccessToken({
        euuid,
        headers,
      });
    } catch (error) {
      setIsProxyTokenError(error as APIError[]);
      throw error;
    }
  };

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      companyName,
      currentBearerToken,
      euuid,
      event,
      handleClose,
      headers,
      isProxyUser,
    }: {
      companyName?: string;
      currentBearerToken?: AuthState['token'];
      euuid: string;
      event: React.MouseEvent<HTMLElement>;
      handleClose: (e: React.SyntheticEvent<HTMLElement>) => void;
      headers?: RequestHeaders;
      isProxyUser: boolean;
    }) => {
      try {
        // TODO: Parent/Child: FOR MSW ONLY, REMOVE WHEN API IS READY
        // ================================================================
        // throw new Error(
        //   `There was an error switching to ${companyName}. Please try again.`
        // );
        // ================================================================

        if (!isParentTokenValid({ isProxyUser })) {
          const expiredTokenError: APIError = {
            field: 'token',
            reason:
              'The reseller account token has expired. You must log back into the account manually.',
          };

          setIsParentTokenError([expiredTokenError]);

          enqueueSnackbar(expiredTokenError.reason, {
            variant: 'error',
          });

          return;
        }

        const proxyToken = await getProxyToken({ euuid, headers });

        // We don't need to worry about this if we're a proxy user.
        if (!isProxyUser) {
          const parentToken = {
            expiry: storage.authentication.expire.get(),
            scopes: storage.authentication.scopes.get(),
            token: currentBearerToken ?? '',
          };

          setTokenInLocalStorage({
            prefix: 'authentication/parent_token',
            token: parentToken,
          });
        }

        setTokenInLocalStorage({
          prefix: 'authentication/proxy_token',
          token: proxyToken,
        });

        setActiveTokenInLocalStorage({
          userType: 'proxy',
        });

        handleClose(event);
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

        enqueueSnackbar(
          `There was an error switching to ${companyName}. Please try again.`,
          {
            variant: 'error',
          }
        );
      }
    },
    [enqueueSnackbar]
  );

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
                setActiveTokenInLocalStorage({ userType: 'parent' });
                handleClose();
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
        currentBearerToken={currentBearerToken}
        headers={headers}
        isProxyUser={isProxyUser}
        onClose={handleClose}
        onSwitchAccount={handleSwitchToChildAccount}
      />
    </Drawer>
  );
};
