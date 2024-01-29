import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

import { LoadBalancerCreateFormWrapper } from './LoadBalancerCreate/LoadBalancerCreateFormWrapper';

const LoadBalancerLanding = React.lazy(() =>
  import('./LoadBalancerLanding/LoadBalancerLanding').then((module) => ({
    default: module.LoadBalancerLanding,
  }))
);

const LoadBalancerDetail = React.lazy(() =>
  import('./LoadBalancerDetail/LoadBalancerDetail').then((module) => ({
    default: module.LoadBalancerDetail,
  }))
);

export const LoadBalancers = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="LoadBalancers" />
      <Switch>
        {/**
         * TODO: AGLB - remove alternative create flow
         */}
        <Route
          component={LoadBalancerCreateFormWrapper}
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
