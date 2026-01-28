import {
  useAllListMyDelegatedChildAccountsQuery,
  useChildAccountsInfiniteQuery,
} from '@linode/queries';
import { Drawer, LinkButton, Notice, Typography } from '@linode/ui';
import React, { useMemo, useState } from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { PARENT_USER_SESSION_EXPIRED } from 'src/features/Account/constants';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage, setStorage, storage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';
import { updateParentTokenInLocalStorage } from './SwitchAccounts/utils';

import type { APIError, Filter, UserType } from '@linode/api-v4';

interface Props {
  onClose: () => void;
  open: boolean;
  userType: undefined | UserType;
}

interface HandleSwitchToChildAccountProps {
  currentTokenWithBearer?: string;
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
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const isProxyUserType = userType === 'proxy';
  const isDelegateUserType = userType === 'delegate';
  const isProxyOrDelegateUserType = isProxyUserType || isDelegateUserType;
  const currentParentTokenWithBearer =
    getStorage('authentication/parent_token/token') ?? '';
  const currentTokenWithBearer = storage.authentication.token.get() ?? '';

  const {
    createToken,
    error: createTokenError,
    revokeToken,
    updateCurrentToken,
    validateParentToken,
  } = useParentChildAuthentication();

  const createTokenErrorReason = createTokenError?.[0]?.reason;

  const filter: Filter = {
    ['+order']: 'asc',
    ['+order_by']: 'company',
    ...(searchQuery && { company: { '+contains': searchQuery } }),
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError: childAccountInfiniteError,
    isFetchingNextPage,
    isInitialLoading,
    isRefetching,
    refetch: refetchChildAccounts,
  } = useChildAccountsInfiniteQuery(
    {
      filter,
      headers: isProxyOrDelegateUserType
        ? {
            Authorization: currentTokenWithBearer,
          }
        : undefined,
    },
    isIAMDelegationEnabled === false
  );
  const {
    data: allChildAccounts,
    error: allChildAccountsError,
    isLoading: allChildAccountsLoading,
    isRefetching: allChildAccountsIsRefetching,
    refetch: refetchAllChildAccounts,
  } = useAllListMyDelegatedChildAccountsQuery({
    params: {},
    enabled: isIAMDelegationEnabled,
  });

  const refetchFn = isIAMDelegationEnabled
    ? refetchAllChildAccounts
    : refetchChildAccounts;

  const handleSwitchToChildAccount = React.useCallback(
    async ({
      currentTokenWithBearer,
      euuid,
      event,
      onClose,
      userType,
    }: HandleSwitchToChildAccountProps) => {
      const isProxyOrDelegateUserType =
        userType === 'proxy' || userType === 'delegate';

      try {
        if (isProxyOrDelegateUserType) {
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
          prefix: isProxyUserType
            ? 'authentication/proxy_token'
            : 'authentication/delegate_token',
          token: {
            ...proxyToken,
            token: `Bearer ${proxyToken.token}`,
          },
        });

        updateCurrentToken({
          userType: isProxyUserType ? 'proxy' : 'delegate',
        });
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

    // Revoke proxy or delegate token before switching to parent account.
    await revokeToken().catch(() => {
      /* Allow user account switching; tokens will expire naturally. */
    });

    updateCurrentToken({ userType: 'parent' });

    // Reset flag for proxy or delegate user to display success toast once.
    if (isProxyUserType) {
      setStorage('is_proxy_user_type', 'false');
    } else if (isDelegateUserType) {
      setStorage('is_delegate_user_type', 'false');
    }

    onClose();
    location.reload();
  }, [
    onClose,
    revokeToken,
    validateParentToken,
    updateCurrentToken,
    isProxyUserType,
    isDelegateUserType,
  ]);

  const [isSwitchingChildAccounts, setIsSwitchingChildAccounts] =
    useState<boolean>(false);

  const handleClose = () => {
    setIsSwitchingChildAccounts(false);
    onClose();
  };

  const childAccounts = useMemo(() => {
    if (isIAMDelegationEnabled) {
      if (searchQuery && allChildAccounts) {
        // Client-side filter: match company field with searchQuery (case-insensitive, contains)
        const normalizedQuery = searchQuery.toLowerCase();
        return allChildAccounts.filter((account) =>
          account.company?.toLowerCase().includes(normalizedQuery)
        );
      }
      return allChildAccounts;
    }
    return data?.pages.flatMap((page) => page.data);
  }, [isIAMDelegationEnabled, searchQuery, allChildAccounts, data]);

  return (
    <Drawer onClose={handleClose} open={open} title="Switch Account">
      {createTokenErrorReason && (
        <Notice text={createTokenErrorReason} variant="error" />
      )}
      {isParentTokenError.length > 0 && (
        <Notice text={isParentTokenError[0].reason} variant="error" />
      )}
      <Typography
        sx={(theme) => ({
          margin: `${theme.spacingFunction(24)} 0`,
        })}
      >
        Select an account to view and manage its settings and configurations
        {isProxyOrDelegateUserType && (
          <>
            {' or '}
            <LinkButton
              aria-label="parent-account-link"
              disabled={isSubmitting}
              onClick={() => {
                sendSwitchToParentAccountEvent();
                handleSwitchToParentAccount();
              }}
            >
              switch back to your account
            </LinkButton>
          </>
        )}
        .
      </Typography>
      {isIAMDelegationEnabled &&
        allChildAccounts &&
        allChildAccounts.length !== 0 && (
          <>
            <DebouncedSearchTextField
              clearable
              debounceTime={250}
              hideLabel
              label="Search"
              onSearch={setSearchQuery}
              placeholder="Search"
              sx={{ marginBottom: 3 }}
              value={searchQuery}
            />
            {searchQuery && childAccounts && childAccounts.length === 0 && (
              <Typography sx={{ fontStyle: 'italic' }}>
                No search results
              </Typography>
            )}
          </>
        )}
      {!isIAMDelegationEnabled && (
        <DebouncedSearchTextField
          clearable
          debounceTime={250}
          hideLabel
          label="Search"
          onSearch={setSearchQuery}
          placeholder="Search"
          sx={{ marginBottom: 3 }}
          value={searchQuery}
        />
      )}
      <ChildAccountList
        childAccounts={childAccounts}
        currentTokenWithBearer={
          isProxyOrDelegateUserType
            ? currentParentTokenWithBearer
            : currentTokenWithBearer
        }
        errors={{
          childAccountInfiniteError,
          allChildAccountsError,
        }}
        fetchNextPage={fetchNextPage}
        filter={filter}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={
          isInitialLoading ||
          isSubmitting ||
          isSwitchingChildAccounts ||
          isRefetching ||
          allChildAccountsLoading ||
          allChildAccountsIsRefetching
        }
        isSwitchingChildAccounts={isSwitchingChildAccounts}
        onClose={onClose}
        onSwitchAccount={handleSwitchToChildAccount}
        refetchFn={refetchFn}
        setIsSwitchingChildAccounts={setIsSwitchingChildAccounts}
        userType={userType}
      />
    </Drawer>
  );
};
