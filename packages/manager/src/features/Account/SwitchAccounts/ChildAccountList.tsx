import React from 'react';
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

import type { UserType } from '@linode/api-v4';

interface ChildAccountListProps {
  currentTokenWithBearer: string;
  onClose: () => void;
  onSwitchAccount: (props: {
    currentTokenWithBearer: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    onClose: () => void;
    userType: UserType | undefined;
  }) => void;
  userType: UserType | undefined;
}

export const ChildAccountList = React.memo(
  ({
    currentTokenWithBearer,
    onClose,
    onSwitchAccount,
    userType,
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
          onClick={(event) =>
            onSwitchAccount({
              currentTokenWithBearer,
              euuid,
              event,
              onClose,
              userType,
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
