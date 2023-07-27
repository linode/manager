import * as React from 'react';

import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';
import { Divider } from 'src/components/Divider';
import LandingHeader from 'src/components/LandingHeader';

const BetasLanding = () => {
  return (
    <>
      <LandingHeader title="Betas" />
      <Paper>
        <Typography variant="h2">Currently Enrolled Betas</Typography>
        <Divider />
      </Paper>
      <Paper style={{ marginTop: 20 }}>
        <Typography variant="h2">Available Betas</Typography>
        <Divider />
      </Paper>
      <Paper style={{ marginTop: 20 }}>
        <Typography variant="h2">Beta Participation History</Typography>
        <Divider />
      </Paper>
    </>
  );
};

export default BetasLanding;
