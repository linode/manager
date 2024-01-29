import Stack from '@mui/material/Stack';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { AGLB_FEEDBACK_FORM_URL } from 'src/features/LoadBalancers/constants';

import { LoadBalancerActionPanel } from './LoadBalancerActionPanel';
import { LoadBalancerConfigurations } from './LoadBalancerConfigurations';
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
        betaFeedbackLink={AGLB_FEEDBACK_FORM_URL}
        title="Create"
      />

      <Stack spacing={3}>
        <LoadBalancerLabel />
        <LoadBalancerRegions />
        <LoadBalancerConfigurations />
        <LoadBalancerActionPanel />
      </Stack>
    </>
  );
};
