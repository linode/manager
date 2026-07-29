import * as React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';

export const NATGatewaysCreate = () => {
  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          labelTitle: 'Create',
        }}
        docsLabel="Getting Started"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nat-gateway"
        spacingBottom={16}
        title="Create"
      />
    </>
  );
};
