import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

const LoadBalancerLanding = React.lazy(
  () => import('./LoadBalancerLanding/LoadBalancerLanding')
);
const LoadBalancerDetail = React.lazy(
  () => import('./LoadBalancerDetail/LoadBalancerDetail')
);
const LoadBalancerCreate = React.lazy(
  () => import('./LoadBalancerCreate/LoadBalancerCreate')
);

const LoadBalancer = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route
          component={LoadBalancerDetail}
          path="/loadbalancers/:loadbalancerId/:tab?"
        />
        <Route component={LoadBalancerCreate} path="/loadbalancers/create" />
        <Route component={LoadBalancerLanding} path="/loadbalancers" />
      </Switch>
    </React.Suspense>
  );
};

export default LoadBalancer;
