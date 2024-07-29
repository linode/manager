import React from 'react';

import { Paper } from 'src/components/Paper';
import { Stack } from 'src/components/Stack';
import { Typography } from 'src/components/Typography';

import { BackupsWarning } from './BackupsWarning';
import { LinodeSelectTable } from '../../shared/LinodeSelectTable';

export const LinodeSelect = () => {
  return (
    <Paper>
      <Stack spacing={1}>
        <Typography variant="h2">Select Linode</Typography>
        <BackupsWarning />
        <LinodeSelectTable />
      </Stack>
    </Paper>
  );
};
