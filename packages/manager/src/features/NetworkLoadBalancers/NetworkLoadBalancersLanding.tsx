import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const NetworkLoadBalancersLanding = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Network Load Balancers',
          removeCrumbX: 1,
        }}
        spacingBottom={16}
        title="Network Load Balancers"
      />
      <Notice variant="info">Network Load Balancers are coming soon...</Notice>
    </>
  );
};
