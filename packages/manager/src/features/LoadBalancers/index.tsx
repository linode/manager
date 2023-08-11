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
const ServiceTargetCreate = React.lazy(
  () => import('./ServiceTargets/ServiceTargetCreate/ServiceTargetCreate')
);
const RouteCreate = React.lazy(
  () => import('./Routes/RouteCreate/RouteCreate')
);

const LoadBalancer = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={RouteCreate} path="/loadbalancers/routes/create" />
        <Route
          component={ServiceTargetCreate}
          path="/loadbalancers/service-target/create"
        />
        <Route component={LoadBalancerCreate} path="/loadbalancers/create" />
        <Route
          component={LoadBalancerDetail}
          path="/loadbalancer/:loadbalancerId/:tab?"
        />
        <Route component={LoadBalancerLanding} path="/loadbalancers/:tab?" />
      </Switch>
    </React.Suspense>
  );
};

export default LoadBalancer;
