import { Button } from '@linode/ui';
import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';

import { useDelegationRole } from '../IAM/hooks/useDelegationRole';

import type { ButtonProps } from '@linode/ui';

export const SwitchAccountButton = (props: ButtonProps) => {
  const { isDelegateUserType } = useDelegationRole();

  return (
    <Button
      startIcon={<SwapIcon data-testid="swap-icon" />}
      sx={(theme) => ({
        '& .MuiButton-startIcon svg path': {
          fill: theme.tokens.alias.Content.Text.Link.Default,
        },
        font: theme.tokens.alias.Typography.Label.Semibold.S,
        marginTop: theme.tokens.spacing.S4,
      })}
      {...props}
    >
      {isDelegateUserType ? 'Switch back to your account' : 'Switch Account'}
    </Button>
  );
};
