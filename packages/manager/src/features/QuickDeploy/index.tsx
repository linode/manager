import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const QuickDeployLanding = React.lazy(() => import('./QuickDeployLanding'));

const QuickDeploy = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <DocumentTitleSegment segment="Quick Deploy" />
      <Switch>
        <Route component={QuickDeployLanding} path="/quick-deploy" />
      </Switch>
    </React.Suspense>
  );
};

export default QuickDeploy;
