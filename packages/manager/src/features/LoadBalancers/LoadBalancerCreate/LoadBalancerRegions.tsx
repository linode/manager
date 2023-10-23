import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { BetaChip } from 'src/components/BetaChip/BetaChip';
import { Country } from 'src/components/EnhancedSelect/variants/RegionSelect/utils';
import { Flag } from 'src/components/Flag';
import { Paper } from 'src/components/Paper';
import { Typography } from 'src/components/Typography';

// TODO: Regious should be updated with the real values
const regions = [
  { country: 'ga', id: 'us-southeast', label: 'Atlanta, GA' },
  { country: 'ca', id: 'ca-central', label: 'Toronto, CA' },
  { country: 'au', id: 'ap-southeast', label: 'Sydney, AU' },
  { country: 'gb', id: 'eu-west', label: 'London, UK' },
  { country: 'fr', id: 'fr-par', label: 'Paris, FR' },
];

export const LoadBalancerRegions = () => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        flexGrow: 1,
        marginTop: theme.spacing(3),
        width: '100%',
      }}
      data-qa-label-header
    >
      <Typography
        data-qa-tp-title
        sx={(theme) => ({ marginBottom: theme.spacing(2) })}
        variant="h2"
      >
        Regions
      </Typography>
      <Stack>
        <Typography sx={(theme) => ({ marginBottom: theme.spacing(1) })}>
          Where this Load Balancer instance will be deployed.
        </Typography>
        <Grid container>
          <BetaChip sx={{ marginLeft: '0 !important' }} />
          <Typography sx={(theme) => ({ marginBottom: theme.spacing(1) })}>
            Load Balancers will be automatically provisioned in these 5 Regions.
            No charges with be incured.
          </Typography>
        </Grid>
        <Grid marginTop={theme.spacing(2)}>
          {regions.map((region) => (
            <Grid
              alignItems={'center'}
              container
              direction="row"
              justifyContent="flex-start"
              key={region.id}
              marginBottom={theme.spacing(1)}
              spacing={2}
            >
              <Grid className="py0">
                <Flag country={region.country as Lowercase<Country>} />
              </Grid>
              <Grid>
                <Typography>{`${region.label} (${region.id})`}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Paper>
  );
};
