import Stack from '@mui/material/Stack';
import * as React from 'react';

import { Divider } from 'src/components/Divider';
import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

const BetasLanding = () => {
  return (
    <>
      <LandingHeader title="Betas" />
      <Stack spacing={2}>
        <Paper>
          <Typography variant="h2">Currently Enrolled Betas</Typography>
          <Divider />
        </Paper>
        <Paper>
          <Typography variant="h2">Available Betas</Typography>
          <Divider />
        </Paper>
        <Paper>
          <Typography variant="h2">Beta Participation History</Typography>
          <Divider />
        </Paper>
      </Stack>
    </>
  );
};

export default BetasLanding;
