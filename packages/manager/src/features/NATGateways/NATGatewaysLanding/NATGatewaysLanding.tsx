import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import { NATGatewaysLandingEmptyState } from './NATGatewaysLandingEmptyState';

export const NATGatewaysLanding = () => {
  // TODO: Replace with actual data check once API queries are implemented
  const showEmptyState = true;

  if (showEmptyState) {
    return <NATGatewaysLandingEmptyState />;
  }
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'NAT Gateways',
          removeCrumbX: 1,
        }}
        spacingBottom={16}
        title="NAT Gateways"
      />
      <Notice variant="info">NAT Gateways is coming soon...</Notice>
    </>
  );
};
