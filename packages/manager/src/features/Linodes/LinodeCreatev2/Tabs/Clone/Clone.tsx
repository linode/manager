import React from 'react';

import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';
import { Region } from 'src/features/Linodes/LinodeCreatev2/Region';

import { LinodeSelectTable } from '../../shared/LinodeSelectTable';
import { CloneWarning } from './CloneWarning';

export const Clone = () => {
  return (
    <Stack spacing={3}>
      <Paper>
        <Stack spacing={1}>
          <Typography variant="h2">Select Linode to Clone From</Typography>
          <CloneWarning />
          <LinodeSelectTable enablePowerOff />
        </Stack>
      </Paper>
      <Region />
    </Stack>
  );
};
