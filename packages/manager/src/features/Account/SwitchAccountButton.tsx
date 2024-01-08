import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';
import { Button, ButtonProps } from 'src/components/Button/Button';

export const SwitchAccountButton = (props: ButtonProps) => {
  return (
    <Button startIcon={<SwapIcon />} {...props}>
      Switch Account
    </Button>
  );
};
