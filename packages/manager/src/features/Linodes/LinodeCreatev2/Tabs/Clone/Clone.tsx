import React from 'react';

import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import { LinodeSelectTable } from '../../shared/LinodeSelectTable';
import { CloneWarning } from './CloneWarning';

export const Clone = () => {
  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Select Linode to Clone From</Typography>
        <CloneWarning />
        <LinodeSelectTable enablePowerOff />
      </Stack>
    </Paper>
  );
};
