import { Drawer, Notice, StyledLinkButton, Typography } from '@linode/ui';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { NotFound } from 'src/components/NotFound';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { useCurrentToken } from 'src/hooks/useAuthentication';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage, setStorage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';
import { updateParentTokenInLocalStorage } from './SwitchAccounts/utils';

import type { APIError, UserType } from '@linode/api-v4';
import type { State as AuthState } from 'src/store/authentication';

interface Props {
  onClose: () => void;
  open: boolean;
  userType: undefined | UserType;
}

interface HandleSwitchToChildAccountProps {
  currentTokenWithBearer?: AuthState['token'];
  euuid: string;
  event: React.MouseEvent<HTMLElement>;
  onClose: (e: React.SyntheticEvent<HTMLElement>) => void;
  userType: undefined | UserType;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { onClose, open, userType } = props;
  const [isSubmitting, setSubmitting] = React.useState<boolean>(false);
  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [query, setQuery] = React.useState<string>('');

  const isProxyUser = userType === 'proxy';
  const currentParentTokenWithBearer =
    getStorage('authentication/parent_token/token') ?? '';
  const currentTokenWithBearer = useCurrentToken() ?? '';

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
      currentTokenWithBearer,
      euuid,
      event,
      onClose,
      userType,
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
        location.reload();
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

    // Flag to prevent multiple clicks on the switch account link.
    setSubmitting(true);

    // Revoke proxy token before switching to parent account.
    await revokeToken().catch(() => {
      /* Allow user account switching; tokens will expire naturally. */
    });

    updateCurrentToken({ userType: 'parent' });

    // Reset flag for proxy user to display success toast once.
    setStorage('is_proxy_user', 'false');

    onClose();
    location.reload();
  }, [onClose, revokeToken, validateParentToken, updateCurrentToken]);

  return (
    <Drawer
      NotFoundComponent={NotFound}
      onClose={onClose}
      open={open}
      title="Switch Account"
    >
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
              aria-label="parent-account-link"
              disabled={isSubmitting}
              onClick={() => {
                sendSwitchToParentAccountEvent();
                handleSwitchToParentAccount();
              }}
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
        isLoading={isSubmitting}
        onClose={onClose}
        onSwitchAccount={handleSwitchToChildAccount}
        searchQuery={query}
        userType={userType}
      />
    </Drawer>
  );
};
