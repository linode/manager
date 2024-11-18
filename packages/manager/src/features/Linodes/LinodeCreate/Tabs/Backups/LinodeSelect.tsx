import { Paper, Stack } from '@linode/ui';
import React from 'react';

import { Typography } from 'src/components/Typography';

import { LinodeSelectTable } from '../../shared/LinodeSelectTable';
import { BackupsWarning } from './BackupsWarning';

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
