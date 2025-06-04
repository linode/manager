import { Paper, Typography } from '@linode/ui';
import React from 'react';

import { useFlags } from 'src/hooks/useFlags';

import Alerts from './Alerts/Alerts';

export const AdditionalOptions = () => {
  const flags = useFlags();

  if (!flags.aclpIntegration) {
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
      <Alerts />
    </Paper>
  );
};
