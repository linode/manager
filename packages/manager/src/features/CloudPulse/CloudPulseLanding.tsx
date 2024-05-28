import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader/LandingHeader';
import { Paper } from 'src/components/Paper';

export const CloudPulseLanding = () => {
  return (
    <>
      <LandingHeader removeCrumbX={1} title="Akamai Cloud Pulse" />
      <Paper></Paper>
    </>
  );
};
