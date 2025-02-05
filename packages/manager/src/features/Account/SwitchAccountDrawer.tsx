import { Notice, StyledLinkButton, Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Drawer } from 'src/components/Drawer';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { authentication, getStorage, setStorage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';
import { updateParentTokenInLocalStorage } from './SwitchAccounts/utils';

import type { Account, APIError, UserType } from '@linode/api-v4';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';

interface Props {
  onClose: () => void;
  open: boolean;
  userType: UserType | undefined;
}

export interface HandleSwitchToChildAccountOptions {
  currentTokenWithBearer?: string;
  account: Account;
  event: React.MouseEvent<HTMLElement>;
  onClose: (e: React.SyntheticEvent<HTMLElement>) => void;
  userType: UserType | undefined;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { onClose, open, userType } = props;
  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [query, setQuery] = React.useState<string>('');

  const isProxyUser = userType === 'proxy';
  const currentParentTokenWithBearer =
    getStorage('authentication/parent_token/token') ?? '';
  const currentTokenWithBearer = authentication.token.get();

  const {
    createToken,
    createTokenError,
    revokeToken,
    updateCurrentToken,
    validateParentToken,
  } = useParentChildAuthentication();

  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const createTokenErrorReason = createTokenError?.[0]?.reason;

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      currentTokenWithBearer,
      account,
      event,
      onClose,
      userType,
    }: HandleSwitchToChildAccountOptions) => {
      const isProxyUser = userType === 'proxy';

      try {
        if (isProxyUser) {
          // Revoke proxy token before switching accounts.
          await revokeToken().catch(() => {
            /* Allow user account switching; tokens will expire naturally. */
          });
        } else {
          // Before switching to a child account, update the parent token in local storage.
          updateParentTokenInLocalStorage({ currentTokenWithBearer });
        }

        const proxyToken = await createToken(account.euuid);

        setTokenInLocalStorage({
          prefix: 'authentication/proxy_token',
          token: {
            ...proxyToken,
            token: `Bearer ${proxyToken.token}`,
          },
        });

        updateCurrentToken({ userType: 'proxy' });

        onClose(event);

        enqueueSnackbar(
          `Account switched to ${account.company ?? account.email}.`,
          {
            variant: 'success',
          }
        );
        queryClient.resetQueries();
      } catch (error) {
        // Error is handled by createTokenError.
      }
    },
    [createToken, updateCurrentToken, revokeToken]
  );

  const handleSwitchToParentAccount = React.useCallback(async () => {
    if (!validateParentToken()) {
      const expiredTokenError: APIError = {
        field: 'token',
        reason: PARENT_USER_SESSION_EXPIRED,
      };

      setIsParentTokenError([expiredTokenError]);

      return;
    }

    // Revoke proxy token before switching to parent account.
    await revokeToken().catch(() => {
      /* Allow user account switching; tokens will expire naturally. */
    });

    updateCurrentToken({ userType: 'parent' });

    onClose();

    enqueueSnackbar(`Account switched to parent account.`, {
      variant: 'success',
    });
    queryClient.resetQueries();
  }, [onClose, revokeToken, validateParentToken, updateCurrentToken]);

  return (
    <Drawer onClose={onClose} open={open} title="Switch Account">
      {createTokenErrorReason && (
        <Notice text={createTokenErrorReason} variant="error" />
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
      <DebouncedSearchTextField
        clearable
        debounceTime={250}
        hideLabel
        label="Search"
        onSearch={setQuery}
        placeholder="Search"
        sx={{ marginBottom: 3 }}
        value={query}
      />
      <ChildAccountList
        currentTokenWithBearer={
          isProxyUser ? currentParentTokenWithBearer : currentTokenWithBearer
        }
        onClose={onClose}
        onSwitchAccount={handleSwitchToChildAccount}
        searchQuery={query}
        userType={userType}
      />
    </Drawer>
  );
};
