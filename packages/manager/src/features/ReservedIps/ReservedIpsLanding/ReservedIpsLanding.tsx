import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

import { ReservedIpsLandingEmptyState } from './ReservedIpsLandingEmptyState';

export const ReservedIpsLanding = () => {
  // TODO: Replace with actual data check once API queries are implemented
  const showEmptyState = true;

  if (showEmptyState) {
    return <ReservedIpsLandingEmptyState />;
  }
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          pathname: 'Reserved IPs',
          removeCrumbX: 1,
        }}
        spacingBottom={16}
        title="Reserved IPs"
      />
      <Notice variant="info">Reserved IPs is coming soon...</Notice>
    </>
  );
};
