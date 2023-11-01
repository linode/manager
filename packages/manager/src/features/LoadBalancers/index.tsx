import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { useFlags } from 'src/hooks/useFlags';

const LoadBalancerLanding = React.lazy(
  () => import('./LoadBalancerLanding/LoadBalancerLanding')
);
const LoadBalancerDetail = React.lazy(
  () => import('./LoadBalancerDetail/LoadBalancerDetail')
);
const LoadBalancerCreate = React.lazy(
  () => import('./LoadBalancerCreate/LoadBalancerCreate')
);
const LoadBalancerBasicCreate = React.lazy(() =>
  import('./LoadBalancerCreate/LoadBalancerBasicCreate').then((module) => ({
    default: module.LoadBalancerBasicCreate,
  }))
);

const LoadBalancer = () => {
  const flags = useFlags();
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="LoadBalancers" />
      <Switch>
        {/**
         * TODO: AGLB - remove alternative create flow
         */}
        <Route
          component={
            flags.aglbFullCreateFlow
              ? LoadBalancerCreate
              : LoadBalancerBasicCreate
          }
          path="/loadbalancers/create"
        />
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
