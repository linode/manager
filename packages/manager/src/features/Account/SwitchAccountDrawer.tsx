import {
  useChildAccountsInfiniteQuery,
  useMyDelegatedChildAccountsQuery,
} from '@linode/queries';
import {
  Button,
  Drawer,
  LinkButton,
  Notice,
  Stack,
  Typography,
  useTheme,
} from '@linode/ui';
import React, { useMemo, useState } from 'react';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useParentChildAuthentication } from 'src/features/Account/SwitchAccounts/useParentChildAuthentication';
import { useSwitchToParentAccount } from 'src/features/Account/SwitchAccounts/useSwitchToParentAccount';
import { setTokenInLocalStorage } from 'src/features/Account/SwitchAccounts/utils';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { sendSwitchToParentAccountEvent } from 'src/utilities/analytics/customEventAnalytics';
import { getStorage, storage } from 'src/utilities/storage';

import { ChildAccountList } from './SwitchAccounts/ChildAccountList';
import { ChildAccountsTable } from './SwitchAccounts/ChildAccountsTable';
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
  const theme = useTheme();
  const [isParentTokenError, setIsParentTokenError] = React.useState<
    APIError[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const isParentUserType = userType === 'parent';
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
  } = useParentChildAuthentication();

  const { handleSwitchToParentAccount, isSubmitting } =
    useSwitchToParentAccount({
      isDelegateUserType,
      isProxyUserType,
      onClose,
      onTokenExpired: (error) => {
        setIsParentTokenError([error]);
      },
    });

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
    data: delegatedChildAccounts,
    error: delegatedChildAccountsError,
    isLoading: delegatedChildAccountsLoading,
    isRefetching: delegatedChildAccountsIsRefetching,
    refetch: refetchDelegatedChildAccounts,
  } = useMyDelegatedChildAccountsQuery({
    params: {
      page,
      page_size: pageSize,
    },
    filter,
    enabled: isIAMDelegationEnabled && isParentUserType,
  });

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
      } catch {
        // Error is handled by createTokenError.
      }
    },
    [createToken, isProxyUserType, updateCurrentToken, revokeToken]
  );

  const [isSwitchingChildAccounts, setIsSwitchingChildAccounts] =
    useState<boolean>(false);

  const isLoading =
    isInitialLoading ||
    isSubmitting ||
    isSwitchingChildAccounts ||
    isRefetching ||
    delegatedChildAccountsLoading ||
    delegatedChildAccountsIsRefetching;

  const refetchFn = isIAMDelegationEnabled
    ? refetchDelegatedChildAccounts
    : refetchChildAccounts;
  const handleClose = () => {
    setIsSwitchingChildAccounts(false);
    setSearchQuery('');
    onClose();
  };

  const childAccounts = useMemo(() => {
    if (isIAMDelegationEnabled) {
      return delegatedChildAccounts?.data || [];
    }
    return data?.pages.flatMap((page) => page.data);
  }, [isIAMDelegationEnabled, delegatedChildAccounts, data]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when search query changes
  };

  const hasError = isIAMDelegationEnabled
    ? delegatedChildAccountsError
    : childAccountInfiniteError;
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

      {hasError && (
        <Stack alignItems="center" gap={1} justifyContent="center">
          <ErrorStateCloud />
          <Typography>Unable to load data.</Typography>
          <Typography>
            Try again or contact support if the issue persists.
          </Typography>
          <Button
            buttonType="primary"
            onClick={() => refetchFn()}
            sx={(theme) => ({
              marginTop: theme.spacingFunction(16),
            })}
          >
            Try again
          </Button>
        </Stack>
      )}
      {!hasError && (
        <>
          <DebouncedSearchTextField
            clearable
            debounceTime={250}
            hideLabel
            key={`switch-search-${searchQuery}`}
            label="Search"
            onSearch={handleSearchQueryChange}
            placeholder="Search"
            sx={{ marginBottom: theme.spacingFunction(12) }}
            value={searchQuery}
          />
          {searchQuery &&
            childAccounts &&
            childAccounts.length === 0 &&
            !isLoading && (
              <Typography
                sx={{
                  fontStyle: 'italic',
                  marginTop: theme.spacingFunction(6),
                }}
              >
                No search results
              </Typography>
            )}
        </>
      )}
      {isIAMDelegationEnabled && (
        <ChildAccountsTable
          childAccounts={childAccounts}
          currentTokenWithBearer={
            isProxyOrDelegateUserType
              ? currentParentTokenWithBearer
              : currentTokenWithBearer
          }
          isLoading={isLoading}
          isSwitchingChildAccounts={isSwitchingChildAccounts}
          onClose={onClose}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onSwitchAccount={handleSwitchToChildAccount}
          page={page}
          pageSize={pageSize}
          setIsSwitchingChildAccounts={setIsSwitchingChildAccounts}
          totalResults={delegatedChildAccounts?.results || 0}
          userType={userType}
        />
      )}
      {!isIAMDelegationEnabled && (
        <ChildAccountList
          childAccounts={childAccounts}
          currentTokenWithBearer={
            isProxyOrDelegateUserType
              ? currentParentTokenWithBearer
              : currentTokenWithBearer
          }
          fetchNextPage={fetchNextPage}
          filter={filter}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={isLoading}
          isSwitchingChildAccounts={isSwitchingChildAccounts}
          onClose={onClose}
          onSwitchAccount={handleSwitchToChildAccount}
          refetchFn={refetchFn}
          setIsSwitchingChildAccounts={setIsSwitchingChildAccounts}
          userType={userType}
        />
      )}
    </Drawer>
  );
};
