import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

const BetasLanding = React.lazy(() => import('./BetasLanding'));

const BetaSignup = React.lazy(() => import('./BetaSignup'));

const BetaRoutes = () => (
  <React.Suspense fallback={<SuspenseLoader />}>
    <Switch>
      <Route component={BetaSignup} path="/betas/signup" />
      <Route component={BetasLanding} exact path="/betas" />
    </Switch>
  </React.Suspense>
);

export default BetaRoutes;
