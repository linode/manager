import Stack from '@mui/material/Stack';
import * as React from 'react';

import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';

import { LoadBalancerConfiguration } from './LoadBalancerConfiguration';
import { LoadBalancerLabel } from './LoadBalancerLabel';
import { LoadBalancerRegions } from './LoadBalancerRegions';

export const LoadBalancerCreate = () => {
  return (
    <>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Global Load Balancers',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        title="Create"
      />
      <Stack spacing={3}>
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
        {/* TODO: AGLB -
         * Implement Review Load Balancer Action Behavior
         * Implement Add Another Configuration Behavior
         */}
        <Box
          columnGap={1}
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          rowGap={3}
        >
          <Button buttonType="outlined">Add Another Configuration</Button>
          <Button buttonType="primary" sx={{ marginLeft: 'auto' }}>
            Review Load Balancer
          </Button>
        </Box>
      </Stack>
    </>
  );
};
