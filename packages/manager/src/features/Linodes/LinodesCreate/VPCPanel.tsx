import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

export const VPCPanel = () => {
  return (
    <Paper sx={(theme) => ({ marginTop: theme.spacing(3) })}>
      <Typography
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        VPC
      </Typography>
    </Paper>
  );
};
