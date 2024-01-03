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
    handleAccountSwitch,
    isParentTokenError,
    isProxyTokenError,
    onClose: _onClose,
    open,
  } = props;

  const onClose = () => {
    _onClose();
  };

  const { data: childAccounts, isLoading } = useChildAccounts({});

  // Toggle to mock error from API.
  // React.useEffect(() => {
  // }, [isProxyTokenError, isParentTokenError]);

  return (
    <Drawer onClose={onClose} open={open} title="Switch Account">
      {(isParentTokenError || isProxyTokenError) && (
        <Notice variant="error">There was an error switching accounts.</Notice>
      )}
      {isLoading ? (
        <CircleProgress mini />
      ) : (
        <Stack>
          {/* TODO */}
          {childAccounts &&
            childAccounts?.data.map((childAccount, key) => {
              return (
                <StyledLinkButton
                  onClick={() => {
                    handleAccountSwitch();
                  }}
                  key={key}
                >
                  {childAccount.company}
                </StyledLinkButton>
              );
            })}
        </Stack>
      )}
    </Drawer>
  );
};
