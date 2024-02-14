import _ from 'lodash';
import React from 'react';
import { useQueryClient } from 'react-query';
import { Waypoint } from 'react-waypoint';

import ErrorStateCloud from 'src/assets/icons/error-state-cloud.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import {
  queryKey as accountQueryKey,
  useChildAccountsInfiniteQuery,
} from 'src/queries/account';

interface ChildAccountListProps {
  currentTokenWithBearer: string;
  isProxyUser: boolean;
  onClose: () => void;
  onSwitchAccount: (props: {
    currentTokenWithBearer: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    handleClose: () => void;
    isProxyUser: boolean;
  }) => void;
}

export const ChildAccountList = React.memo(
  ({
    currentTokenWithBearer,
    isProxyUser,
    onClose,
    onSwitchAccount,
  }: ChildAccountListProps) => {
    const {
      data,
      fetchNextPage,
      hasNextPage,
      isError,
      isFetchingNextPage,
      isLoading,
      refetch: refetchChildAccounts,
    } = useChildAccountsInfiniteQuery({
      headers: isProxyUser
        ? {
            Authorization: currentTokenWithBearer,
          }
        : undefined,
    });
    const queryClient = useQueryClient();
    const childAccounts = data?.pages.flatMap((page) => page.data);

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircleProgress mini size={70} />
        </Box>
      );
    }

    if (childAccounts?.length === 0) {
      return (
        <Notice variant="info">There are no indirect customer accounts.</Notice>
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
            onClick={() => {
              queryClient.invalidateQueries([
                accountQueryKey,
                'childAccounts',
                'infinite',
              ]);
              refetchChildAccounts();
            }}
            sx={(theme) => ({
              marginTop: theme.spacing(2),
            })}
            buttonType="primary"
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
          onClick={(event) =>
            onSwitchAccount({
              currentTokenWithBearer,
              euuid,
              event,
              handleClose: onClose,
              isProxyUser,
            })
          }
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
        {isFetchingNextPage && <CircleProgress mini />}
      </Stack>
    );
  }
);
