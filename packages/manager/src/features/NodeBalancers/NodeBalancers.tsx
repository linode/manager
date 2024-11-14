import { CircleProgress } from '@linode/ui';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';

const NodeBalancerDetail = React.lazy(() =>
  import('./NodeBalancerDetail/NodeBalancerDetail').then((module) => ({
    default: module.NodeBalancerDetail,
  }))
);
const NodeBalancersLanding = React.lazy(
  () => import('./NodeBalancersLanding/NodeBalancersLanding')
);
const NodeBalancerCreate = React.lazy(() => import('./NodeBalancerCreate'));

const NodeBalancers = () => {
  return (
    <React.Suspense fallback={<CircleProgress />}>
      <ProductInformationBanner bannerLocation="NodeBalancers" />
      <Switch>
        <Route component={NodeBalancersLanding} exact path="/nodebalancers" />
        <Route
          component={NodeBalancerCreate}
          exact
          path="/nodebalancers/create"
        />
        <Route
          component={NodeBalancerDetail}
          path="/nodebalancers/:nodeBalancerId?/:tab?/:configId?"
        />
      </Switch>
    </React.Suspense>
  );
};

export default NodeBalancers;
