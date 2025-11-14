import { Button } from '@linode/ui';
import * as React from 'react';

import SwapIcon from 'src/assets/icons/swapSmall.svg';

import { useIsIAMDelegationEnabled } from '../IAM/hooks/useIsIAMEnabled';
import { usePermissions } from '../IAM/hooks/usePermissions';

import type { ButtonProps } from '@linode/ui';

export const SwitchAccountButton = (props: ButtonProps) => {
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();

  const { data: permissions } = usePermissions('account', [
    'create_child_account_token',
  ]);

  return (
    <Button
      disabled={
        isIAMDelegationEnabled ? !permissions.create_child_account_token : false
      }
      startIcon={<SwapIcon data-testid="swap-icon" />}
      sx={(theme) => ({
        '& .MuiButton-startIcon svg path': {
          fill: theme.tokens.alias.Content.Text.Link.Default,
        },
        font: theme.tokens.alias.Typography.Label.Semibold.S,
        marginTop: theme.tokens.spacing.S4,
      })}
      tooltipText={
        isIAMDelegationEnabled && !permissions.create_child_account_token
          ? 'You do not have permission to switch accounts.'
          : undefined
      }
      {...props}
    >
      Switch Account
    </Button>
  );
};
