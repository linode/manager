import { UserType } from '@linode/api-v4/lib/account/types';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';
import { Button } from 'src/components/Button/Button';

interface Props {
  handleClose: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  userType: UserType | null;
}

export const SwitchAccountButton = (props: Props) => {
  const { handleClose, setIsDrawerOpen, userType } = props;

  return (
    <StyledButton
      onClick={() => {
        // From proxy accounts, make a request on behalf of the parent account to fetch child accounts.
        if (userType === 'proxy') {
          // TODO: Parent/Child - M3-7430
        }

        handleClose();
        setIsDrawerOpen(true);
      }}
      buttonType="outlined"
    >
      <StyledSwapIcon />
      Switch Account
    </StyledButton>
  );
};

const StyledButton = styled(Button)(({ theme }) => ({
  '& path': {
    fill: theme.textColors.linkActiveLight,
  },
  '&:hover, &:focus': {
    '& path': {
      fill: theme.name === 'dark' ? '#fff' : theme.textColors.linkActiveLight,
    },
  },
  marginRight: theme.spacing(1),
}));

const StyledSwapIcon = styled(SwapIcon)(({ theme }) => ({
  marginRight: theme.spacing(1),
}));
