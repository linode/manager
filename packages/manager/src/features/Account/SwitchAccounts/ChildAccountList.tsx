import { useChildAccountsInfiniteQuery } from '@linode/queries';
import {
  Box,
  Button,
  CircleProgress,
  Notice,
  Stack,
  StyledLinkButton,
  Typography,
} from '@linode/ui';
import React, { useState } from 'react';
import { Waypoint } from 'react-waypoint';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';

import type { Filter, UserType } from '@linode/api-v4';

interface ChildAccountListProps {
  currentTokenWithBearer: string;
  isLoading?: boolean;
  onClose: () => void;
  onSwitchAccount: (props: {
    currentTokenWithBearer: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    onClose: () => void;
    userType: undefined | UserType;
  }) => void;
  searchQuery: string;
  userType: undefined | UserType;
}

export const ChildAccountList = React.memo(
  ({
    currentTokenWithBearer,
    isLoading,
    onClose,
    onSwitchAccount,
    searchQuery,
    userType,
  }: ChildAccountListProps) => {
    const filter: Filter = {
      ['+order']: 'asc',
      ['+order_by']: 'company',
      ...(searchQuery && { company: { '+contains': searchQuery } }),
    };

    const [isSwitchingChildAccounts, setIsSwitchingChildAccounts] =
      useState<boolean>(false);
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
      headers:
        userType === 'proxy'
          ? {
              Authorization: currentTokenWithBearer,
            }
          : undefined,
    });
    const childAccounts = data?.pages.flatMap((page) => page.data);

    if (
      isInitialLoading ||
      isLoading ||
      isSwitchingChildAccounts ||
      isRefetching
    ) {
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
          {Object.prototype.hasOwnProperty.call(filter, 'company')
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
            buttonType="primary"
            onClick={() => refetchChildAccounts()}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
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
            marginBottom: theme.spacing(2),
          })}
        >
          {childAccount.company}
        </StyledLinkButton>
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
