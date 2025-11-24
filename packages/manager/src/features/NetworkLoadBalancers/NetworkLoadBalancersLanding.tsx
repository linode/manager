import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const NetworkLoadBalancersLanding = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Network Load Balancer',
          removeCrumbX: 1,
        }}
        spacingBottom={16}
        title="Network Load Balancer"
      />
      <Notice variant="info">Network Load Balancer is coming soon...</Notice>
    </>
  );
};
