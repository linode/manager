import { Box, CircleProgress, LinkButton, Notice, Stack } from '@linode/ui';
import React from 'react';
import { Waypoint } from 'react-waypoint';

import type { ChildAccount, Filter, UserType } from '@linode/api-v4';

export interface ChildAccountListProps {
  childAccounts: ChildAccount[] | undefined;
  currentTokenWithBearer: string;
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
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }: ChildAccountListProps) => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      );
    }

    if (childAccounts && childAccounts.length === 0) {
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
