import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';

const VPCLanding = React.lazy(() => import('./VPCLanding'));

const VPC = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="VPC" />
      <Switch>
        <Route component={VPCLanding} exact strict />
      </Switch>
    </React.Suspense>
  );
};

export default VPC;
