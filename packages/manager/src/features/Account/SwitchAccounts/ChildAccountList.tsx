import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { useChildAccountsInfiniteQuery } from 'src/queries/account/account';

import type { Account, Filter, UserType } from '@linode/api-v4';

interface ChildAccountListProps {
  isLoading?: boolean;
  onClose: () => void;
  onSwitchAccount: (props: {
    currentTokenWithBearer: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    onClose: () => void;
    userType: UserType | undefined;
    childAccount: Account;
  }) => void;
  searchQuery: string;
  userType: UserType | undefined;
}

export const ChildAccountList = React.memo(
  ({
    isLoading,
    onClose,
    onSwitchAccount,
    searchQuery,
    userType,
  }: ChildAccountListProps) => {
    const filter: Filter = {
      ['+order']: 'asc',
      ['+order_by']: 'company',
    };
    if (searchQuery) {
      filter['company'] = { '+contains': searchQuery };
    }

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isError,
      isFetchingNextPage,
      isInitialLoading,
      isRefetching,
      refetch: refetchChildAccounts,
    } = useChildAccountsInfiniteQuery({
      filter,
      headers: {
        Authorization:
          localStorage.getItem('authentication/parent_token/token') ??
          undefined,
      },
    });
    const childAccounts = data?.pages.flatMap((page) => page.data);

    if (isInitialLoading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircleProgress size="md" />
        </Box>
      );
    }

    if (childAccounts?.length === 0) {
      return (
        <Notice variant="info">
          There are no child accounts
          {filter.hasOwnProperty('company')
            ? ' that match this query'
            : undefined}
          .
        </Notice>
      );
    }

    if (isError) {
      return (
        <Stack alignItems="center" gap={1} justifyContent="center">
          <ErrorStateCloud />
          <Typography>Unable to load data.</Typography>
          <Typography>
            Try again or contact support if the issue persists.
          </Typography>
          <Button
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            buttonType="primary"
            onClick={() => refetchChildAccounts()}
          >
            Try again
          </Button>
        </Stack>
      );
    }

    const renderChildAccounts = childAccounts?.map((childAccount, idx) => {
      const euuid = childAccount.euuid;
      return (
        <StyledLinkButton
          onClick={(event) => {
            onSwitchAccount({
              currentTokenWithBearer:
                localStorage.getItem('authentication/token') ?? '',
              euuid,
              event,
              onClose,
              userType,
              childAccount,
            });
          }}
          sx={(theme) => ({
            marginBottom: theme.spacing(2),
          })}
          key={`child-account-link-button-${idx}`}
        >
          {childAccount.company}
        </StyledLinkButton>
      );
    });

    return (
      <Stack alignItems={'flex-start'} data-testid="child-account-list">
        {renderChildAccounts}
        {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
        {isFetchingNextPage && <CircleProgress size="sm" />}
      </Stack>
    );
  }
);
