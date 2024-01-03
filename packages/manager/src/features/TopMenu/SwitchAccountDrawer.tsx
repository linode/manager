import React from 'react';

import { StyledLinkButton } from 'src/components/Button/StyledLinkButton';
import { CircleProgress } from 'src/components/CircleProgress';
import { Drawer } from 'src/components/Drawer';
import { Notice } from 'src/components/Notice/Notice';
import { Stack } from 'src/components/Stack';
import { useChildAccounts } from 'src/queries/account';

interface Props {
  handleAccountSwitch: () => void;
  isParentTokenError: boolean;
  isProxyTokenError: boolean;
  onClose: () => void;
  open: boolean;
  username: string;
}

export const SwitchAccountDrawer = (props: Props) => {
  const {
    // handleAccountSwitch,
    isParentTokenError,
    isProxyTokenError,
    onClose: _onClose,
    open,
  } = props;

  const onClose = () => {
    _onClose();
  };

  const { data: childAccounts, error, isLoading } = useChildAccounts({});

  const renderChildAccounts = React.useCallback(() => {
    if (isLoading) {
      return <CircleProgress mini />;
    }

    if (childAccounts?.results === 0) {
      return <Notice>There are no child accounts.</Notice>;
    }

    if (error) {
      return (
        <Notice variant="error">
          There was an error loading child accounts.
        </Notice>
      );
    }

    return childAccounts?.data.map((childAccount, key) => (
      <StyledLinkButton
        onClick={() => {
          // TODO: Parent/Child - M3-7430
          // handleAccountSwitch();
        }}
        key={key}
      >
        {childAccount.company}
      </StyledLinkButton>
    ));
  }, [childAccounts, error, isLoading]);

  return (
    <Drawer onClose={onClose} open={open} title="Switch Account">
      {(isParentTokenError || isProxyTokenError) && (
        <Notice variant="error">There was an error switching accounts.</Notice>
      )}
      <Stack>{renderChildAccounts()}</Stack>
    </Drawer>
  );
};
