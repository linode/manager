import { Typography, styled } from '@mui/material';
import { AxiosHeaders } from 'axios';
import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { useFlags } from 'src/hooks/useFlags';
import { useChildAccounts } from 'src/queries/account';
import { useAccountUser } from 'src/queries/accountUsers';
import { useProfile } from 'src/queries/profile';
import { authentication } from 'src/utilities/storage';

interface Props {
  onClose: () => void;
  open: boolean;
  username: string;
}

export const SwitchAccountDrawer = (props: Props) => {
  const { onClose, open } = props;

  const flags = useFlags();

  const handleClose = () => {
    onClose();
  };

  const { data: profile } = useProfile();
  const { data: user } = useAccountUser(profile?.username ?? '');

  // From proxy accounts, make a request on behalf of the parent account to fetch child accounts.
  const headers =
    flags.parentChildAccountAccess && user?.user_type === 'proxy'
      ? new AxiosHeaders({ Authorization: authentication.token.get() }) // TODO: Parent/Child - M3-7430: replace this token with the parent token in local storage.
      : undefined;
  const { data: childAccounts, error, isLoading } = useChildAccounts({
    headers,
  });

  const renderChildAccounts = React.useCallback(() => {
    if (isLoading) {
      return <CircleProgress mini />;
    }

    if (childAccounts?.results === 0) {
      return <Notice variant="info">There are no child accounts.</Notice>;
    }

    if (error) {
      return (
        <Notice variant="error">
          There was an error loading child accounts.
        </Notice>
      );
    }

    return childAccounts?.data.map((childAccount, idx) => (
      <StyledChildAccountLinkButton
        onClick={() => {
          // TODO: Parent/Child - M3-7430
          // handleAccountSwitch();
        }}
        key={`child-account-link-button-${idx}`}
      >
        {childAccount.company}
      </StyledChildAccountLinkButton>
    ));
  }, [childAccounts, error, isLoading]);

  return (
    <Drawer onClose={handleClose} open={open} title="Switch Account">
      <StyledTypography>
        Select an account to view and manage its settings and configurations
        {user?.user_type === 'proxy' && (
          <>
            {' '}
            or {/* TODO: Parent/Child - M3-7430 */}
            <StyledLinkButton
              aria-label="parent-account-link"
              onClick={() => null}
            >
              switch back to your account
            </StyledLinkButton>
          </>
        )}
        .
      </StyledTypography>
      <Stack alignItems={'flex-start'} data-testid="child-account-list">
        {renderChildAccounts()}
      </Stack>
    </Drawer>
  );
};

const StyledTypography = styled(Typography)(({ theme }) => ({
  margin: `${theme.spacing(3)} 0`,
}));

const StyledChildAccountLinkButton = styled(StyledLinkButton)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));
