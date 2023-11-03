import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
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
      <ProductInformationBanner bannerLocation="LoadBalancers" />
      <Switch>
        <Route component={LoadBalancerCreate} path="/loadbalancers/create" />
        <Route
          component={LoadBalancerDetail}
          path="/loadbalancers/:loadbalancerId"
        />
        <Route component={LoadBalancerLanding} path="/loadbalancers" />
      </Switch>
    </React.Suspense>
  );
};

export default LoadBalancer;
