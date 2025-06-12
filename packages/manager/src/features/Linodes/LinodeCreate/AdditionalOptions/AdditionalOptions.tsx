import { Divider, Paper, Stack, Typography } from '@linode/ui';
import React from 'react';

import { useVMHostMaintenanceEnabled } from 'src/features/Account/utils';
import { MaintenancePolicy } from 'src/features/Linodes/LinodeCreate/AdditionalOptions/MaintenancePolicy';
import { useFlags } from 'src/hooks/useFlags';

import { Alerts } from './Alerts/Alerts';

export const AdditionalOptions = () => {
  const flags = useFlags();
  const { isVMHostMaintenanceEnabled } = useVMHostMaintenanceEnabled();

  if (!flags.aclpIntegration && !isVMHostMaintenanceEnabled) {
    return null;
  }

  return (
    <Paper>
      <Typography
        sx={(theme) => ({ mb: theme.spacingFunction(16) })}
        variant="h2"
      >
        Additional Options
      </Typography>
      <Stack divider={<Divider />}>
        {flags.aclpIntegration && <Alerts />}
        {isVMHostMaintenanceEnabled && <MaintenancePolicy />}
      </Stack>
    </Paper>
  );
};
