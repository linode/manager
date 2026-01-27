import {
  Box,
  Button,
  CircleProgress,
  LinkButton,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { Waypoint } from 'react-waypoint';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';
import { useIsIAMDelegationEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';

import type { ChildAccount, Filter, UserType } from '@linode/api-v4';

export interface ChildAccountListProps {
  childAccounts: ChildAccount[] | undefined;
  currentTokenWithBearer: string;
  errors: {
    allChildAccountsError: Error | null;
    childAccountInfiniteError: boolean;
  };
  fetchNextPage: () => void;
  filter: Filter;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoading?: boolean;
  isSwitchingChildAccounts: boolean;
  onClose: () => void;
  onSwitchAccount: (props: {
    currentTokenWithBearer: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    onClose: () => void;
    userType: undefined | UserType;
  }) => void;
  refetchFn: () => void;
  setIsSwitchingChildAccounts: (isSwitchingChildAccounts: boolean) => void;
  userType: undefined | UserType;
}

export const ChildAccountList = React.memo(
  ({
    childAccounts,
    currentTokenWithBearer,
    filter,
    isLoading,
    isSwitchingChildAccounts,
    setIsSwitchingChildAccounts,
    onClose,
    onSwitchAccount,
    userType,
    refetchFn,
    errors,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }: ChildAccountListProps) => {
    const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

    const hasError = isIAMDelegationEnabled
      ? errors.allChildAccountsError
      : errors.childAccountInfiniteError;

    if (hasError) {
      return (
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
      );
    }

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      );
    }

    if (
      !isIAMDelegationEnabled &&
      childAccounts &&
      childAccounts.length === 0
    ) {
      return (
        <Notice variant="info">
          There are no child accounts
          {Object.prototype.hasOwnProperty.call(filter, 'company')
            ? ' that match this query'
            : undefined}
          .
        </Notice>
      );
    }

    if (
      isIAMDelegationEnabled &&
      childAccounts &&
      childAccounts.length === 0 &&
      !Object.prototype.hasOwnProperty.call(filter, 'company')
    ) {
      return (
        <Notice variant="info">
          You don&apos;t have access to other accounts. You must be added to a
          delegation by your account administrator to have access to other
          accounts.
        </Notice>
      );
    }

    const renderChildAccounts = childAccounts?.map((childAccount, idx) => {
      const euuid = childAccount.euuid;
      return (
        <LinkButton
          disabled={isSwitchingChildAccounts}
          key={`child-account-link-button-${idx}`}
          onClick={(event) => {
            setIsSwitchingChildAccounts(true);
            onSwitchAccount({
              currentTokenWithBearer,
              euuid,
              event,
              onClose,
              userType,
            });
          }}
          sx={(theme) => ({
            marginBottom: theme.spacingFunction(16),
          })}
        >
          {childAccount.company}
        </LinkButton>
      );
    });

    return (
      <Stack alignItems={'flex-start'} data-testid="child-account-list">
        {!isSwitchingChildAccounts && !isLoading && renderChildAccounts}
        {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
        {isFetchingNextPage && <CircleProgress size="sm" />}
      </Stack>
    );
  }
);
