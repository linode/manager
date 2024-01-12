import React from 'react';
import { useQueryClient } from 'react-query';

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
  useChildAccounts,
} from 'src/queries/account';

import type { RequestHeaders } from '@linode/api-v4';

interface ChildAccountListProps {
  currentBearerToken: string;
  headers: RequestHeaders | undefined;
  isProxyUser: boolean;
  onClose: () => void;
  onSwitchAccount: (props: {
    companyName: string;
    currentBearerToken: string;
    euuid: string;
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>;
    handleClose: () => void;
    headers: RequestHeaders | undefined;
    isProxyUser: boolean;
  }) => void;
}

export const ChildAccountList = React.memo(
  ({
    currentBearerToken,
    headers,
    isProxyUser,
    onClose,
    onSwitchAccount,
  }: ChildAccountListProps) => {
    const {
      data: childAccounts,
      isError,
      isLoading,
      refetch: refetchChildAccounts,
    } = useChildAccounts({
      headers,
    });
    const queryClient = useQueryClient();

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center">
          <CircleProgress mini size={70} />
        </Box>
      );
    }

    if (childAccounts?.results === 0) {
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
                'paginated',
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

    const renderChildAccounts = childAccounts?.data.map((childAccount, idx) => {
      const euuid = childAccount.euuid;
      return (
        <StyledLinkButton
          onClick={(event) =>
            onSwitchAccount({
              companyName: childAccount.company,
              currentBearerToken,
              euuid,
              event,
              handleClose: onClose,
              headers,
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
      </Stack>
    );
  }
);
