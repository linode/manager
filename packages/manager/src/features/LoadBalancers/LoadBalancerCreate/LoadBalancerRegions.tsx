import Stack from '@mui/material/Stack';
import * as React from 'react';

import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

// TODO: AGLB -  Regious should be updated with the real values
const regions = [
  { country: 'ga', id: 'us-southeast', label: 'Atlanta, GA' },
  { country: 'ca', id: 'ca-central', label: 'Toronto, CA' },
  { country: 'au', id: 'ap-southeast', label: 'Sydney, AU' },
  { country: 'gb', id: 'eu-west', label: 'London, UK' },
  { country: 'fr', id: 'fr-par', label: 'Paris, FR' },
];

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
            <BetaChip sx={{ marginLeft: '0 !important' }} /> Load Balancers will
            be automatically provisioned in these 5 Regions. No charges with be
            incurred.
          </Typography>
        </Stack>
        <Stack py={0.5} spacing={1.25}>
          {regions.map((region) => (
            <Stack
              alignItems="center"
              direction="row"
              key={region.id}
              spacing={2}
            >
              <Flag country={region.country as Lowercase<Country>} />
              <Typography>{`${region.label} (${region.id})`}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
