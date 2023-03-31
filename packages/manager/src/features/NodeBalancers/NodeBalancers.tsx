import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';

const NodeBalancerDetail = React.lazy(
  () => import('./NodeBalancerDetail/NodeBalancerDetail')
);
const NodeBalancersLanding = React.lazy(
  () => import('./NodeBalancersLanding/NodeBalancersLanding')
);
const NodeBalancerCreate = React.lazy(() => import('./NodeBalancerCreate'));

const NodeBalancers = () => {
  return (
    <React.Suspense fallback={<CircleProgress />}>
      <Switch>
        <Route component={NodeBalancersLanding} path="/nodebalancers" exact />
        <Route
          component={NodeBalancerCreate}
          path="/nodebalancers/create"
          exact
        />
        <Route
          component={NodeBalancerDetail}
          path="/nodebalancers/:nodeBalancerId"
        />
      </Switch>
    </React.Suspense>
  );
};

export default NodeBalancers;
