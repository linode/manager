import { Divider, Paper, Typography } from '@linode/ui';
import React from 'react';

import { MaintenancePolicy } from 'src/features/Linodes/LinodeCreate/MaintenancePolicy/MaintenancePolicy';
import { useFlags } from 'src/hooks/useFlags';

import { Alerts } from './Alerts/Alerts';

export const AdditionalOptions = () => {
  const flags = useFlags();

  return (
    <Paper>
      <Typography
        sx={(theme) => ({ mb: theme.spacingFunction(16) })}
        variant="h2"
      >
        Additional Options
      </Typography>
      {flags.aclpIntegration && (
        <>
          <Alerts />
          <Divider />
        </>
      )}
      <MaintenancePolicy />
    </Paper>
  );
};
