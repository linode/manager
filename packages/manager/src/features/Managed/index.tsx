import * as React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const ManagedLanding = React.lazy(() => import('./ManagedLanding'));

const Managed: React.FC = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ManagedLanding} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(Managed);
