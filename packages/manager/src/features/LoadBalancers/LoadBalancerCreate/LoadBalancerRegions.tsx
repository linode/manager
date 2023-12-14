import Stack from '@mui/material/Stack';
import * as React from 'react';

import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

import { LoadBalancerRegions as Regions } from '../LoadBalancerDetail/LoadBalancerRegions';

export const LoadBalancerRegions = () => {
  return (
    <Paper>
      <Stack spacing={2}>
        <Typography variant="h2">Regions</Typography>
        <Stack spacing={1}>
          <Typography>
            Where this Load Balancer instance will be deployed.
          </Typography>
          <Typography>
            <BetaChip
              component="span"
              sx={{ marginLeft: '0 !important', marginRight: '8px !important' }}
            />
            Load Balancers will be automatically provisioned in these 5 Regions.
            No charges with be incurred.
          </Typography>
        </Stack>
        <Regions />
      </Stack>
    </Paper>
  );
};
