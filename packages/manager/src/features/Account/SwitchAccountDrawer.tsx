import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Typography } from 'src/components/Typography';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage, setStorage } from 'src/utilities/storage';

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

interface HandleSwitchToChildAccountProps {
  euuid: string;
  event: React.MouseEvent<HTMLElement>;
  onClose: (e: React.SyntheticEvent<HTMLElement>) => void;
  userType: UserType | undefined;
  childAccount: Account;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { onClose, open, userType } = props;
  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [query, setQuery] = React.useState<string>('');

  const queryClient = useQueryClient();
  const { enqueueSnackbar} = useSnackbar();

  const isProxyUser = userType === 'proxy';

  const currentTokenWithBearer = localStorage.getItem('authentication/token');

  const {
    createToken,
    createTokenError,
    revokeToken,
    updateCurrentToken,
    validateParentToken,
  } = useParentChildAuthentication();

  const createTokenErrorReason = createTokenError?.[0]?.reason;

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      euuid,
      event,
      onClose,
      userType,
      childAccount,
    }: HandleSwitchToChildAccountProps) => {
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

        const proxyToken = await createToken(euuid);

        setTokenInLocalStorage({
          prefix: 'authentication/proxy_token',
          token: {
            ...proxyToken,
            token: `Bearer ${proxyToken.token}`,
          },
        });

        updateCurrentToken({ userType: 'proxy' });
        onClose(event);

        enqueueSnackbar(`Account switched to ${childAccount.company}.`, {
          variant: 'success',
        });

        queryClient.resetQueries();
      } catch (error) {
        // Error is handled by createTokenError.
      }
    },
    [createToken, updateCurrentToken, revokeToken, currentTokenWithBearer]
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

    enqueueSnackbar(`Account switched to parent account.`, {
      variant: 'success',
    });

    onClose();
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
        onClose={onClose}
        onSwitchAccount={handleSwitchToChildAccount}
        searchQuery={query}
        userType={userType}
      />
    </Drawer>
  );
};
