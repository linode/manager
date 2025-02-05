import {
  Box,
  Button,
  CircleProgress,
  Notice,
  Stack,
  StyledLinkButton,
} from '@linode/ui';
import { Typography } from '@linode/ui';
import React from 'react';
import { Waypoint } from 'react-waypoint';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';
import { useChildAccountsInfiniteQuery } from 'src/queries/account/account';

import type { HandleSwitchToChildAccountOptions } from '../SwitchAccountDrawer';
import type { Filter, UserType } from '@linode/api-v4';

interface ChildAccountListProps {
  currentTokenWithBearer: string;
  onClose: () => void;
  onSwitchAccount: (props: HandleSwitchToChildAccountOptions) => void;
  searchQuery: string;
  userType: UserType | undefined;
}

export const ChildAccountList = React.memo(
  ({
    currentTokenWithBearer,
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

    const {
      data,
      fetchNextPage,
      hasNextPage,
      isError,
      isLoading,
      isFetchingNextPage,
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

    if (isLoading) {
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
      return (
        <StyledLinkButton
          onClick={(event) => {
            onSwitchAccount({
              account: childAccount,
              currentTokenWithBearer,
              event,
              onClose,
              userType,
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
        {!isLoading && renderChildAccounts}
        {hasNextPage && <Waypoint onEnter={() => fetchNextPage()} />}
        {isFetchingNextPage && <CircleProgress size="sm" />}
      </Stack>
    );
  }
);
