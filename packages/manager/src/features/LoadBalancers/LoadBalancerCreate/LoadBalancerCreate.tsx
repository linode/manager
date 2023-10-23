import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { LoadBalancerLabel } from './LoadBalancerLable';
import { LoadBalancerRegions } from './LoadBalancerRegions';

const LoadBalancerCreate = () => {
  return (
    <Grid className="m0" container spacing={0}>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader title="Create" />
      <LoadBalancerLabel
        labelFieldProps={{
          disabled: false,
          errorText: '',
          label: 'Linode Label',
          onChange: () => null,
          value: '',
        }}
      />
      <LoadBalancerRegions />
      <LoadBalancerConfiguration />
    </Grid>
  );
};

export default LoadBalancerCreate;
