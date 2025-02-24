import Grid from '@mui/material/Grid2';
import * as React from 'react';

import { CPUGauge } from '../../LongviewLanding/Gauges/CPU';
import { LoadGauge } from '../../LongviewLanding/Gauges/Load';
import { NetworkGauge } from '../../LongviewLanding/Gauges/Network';
import { RAMGauge } from '../../LongviewLanding/Gauges/RAM';
import { StorageGauge } from '../../LongviewLanding/Gauges/Storage';
import { SwapGauge } from '../../LongviewLanding/Gauges/Swap';

import type { APIError } from '@linode/api-v4';

interface Props {
  clientID: number;
  lastUpdatedError?: APIError[];
}

export const GaugesSection = React.memo((props: Props) => {
  return (
    <Grid
      container
      padding={2}
      rowSpacing={4}
      size={{ md: 5, xs: 12 }}
      spacing={2}
    >
      <Grid size={{ xs: 4 }}>
        <CPUGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <RAMGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <SwapGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <LoadGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <NetworkGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <StorageGauge
          clientID={props.clientID}
          lastUpdatedError={props.lastUpdatedError}
        />
      </Grid>
    </Grid>
  );
});
