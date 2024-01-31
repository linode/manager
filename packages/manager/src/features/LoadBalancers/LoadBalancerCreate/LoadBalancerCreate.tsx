import Stack from '@mui/material/Stack';
import React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle/DocumentTitle';
import { LandingHeader } from 'src/components/LandingHeader';
import { ACLB_FEEDBACK_FORM_URL } from 'src/features/LoadBalancers/constants';
import { useFlags } from 'src/hooks/useFlags';

import { LoadBalancerActionPanel } from './LoadBalancerActionPanel';
import { LoadBalancerConfigurations } from './LoadBalancerConfigurations';
import { LoadBalancerLabel } from './LoadBalancerLabel';
import { LoadBalancerRegions } from './LoadBalancerRegions';

export const LoadBalancerCreate = () => {
  const flags = useFlags();

  return (
    <>
      <DocumentTitleSegment segment="Create a Load Balancer" />
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: 'Cloud Load Balancers',
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        betaFeedbackLink={flags.aclb ? ACLB_FEEDBACK_FORM_URL : undefined}
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
