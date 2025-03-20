import { Button } from '@linode/ui';
import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';

import type { ButtonProps } from '@linode/ui';

export const SwitchAccountButton = (props: ButtonProps) => {
  return (
    <Button
      sx={(theme) => ({
        font: theme.tokens.alias.Typography.Label.Semibold.S,
        marginTop: theme.tokens.spacing.S4,
      })}
      startIcon={<SwapIcon data-testid="swap-icon" />}
      {...props}
    >
      Switch Account
    </Button>
  );
};
