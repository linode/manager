import * as React from 'react';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

// This will be implemented as part of a different story.
export const NetworkLoadBalancersLandingEmptyState = () => {
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Network Load Balancer" />
      <Placeholder isEntity title="Network Load Balancer"></Placeholder>
    </React.Fragment>
  );
};
