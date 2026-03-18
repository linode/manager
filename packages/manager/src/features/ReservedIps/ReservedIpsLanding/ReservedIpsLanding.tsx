import { Notice } from '@linode/ui';
import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const ReservedIpsLanding = () => {
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
