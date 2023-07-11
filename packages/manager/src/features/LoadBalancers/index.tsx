import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const LoadBalancerLanding = React.lazy(
  () => import('./LoadBalancerLanding/LoadBalancerLanding')
);
const LoadBalancerDetail = React.lazy(
  () => import('./LoadBalancerDetail/LoadBalancerDetail')
);
const LoadBalancerCreate = React.lazy(
  () => import('./LoadBalancerCreate/LoadBalancerCreate')
);
const EntryPointCreate = React.lazy(
  () => import('./EntryPoints/EntryPointCreate/EntryPointCreate')
);
const RouteCreate = React.lazy(
  () => import('./Routes/RouteCreate/RouteCreate')
);

type CombinedProps = RouteComponentProps;

const LoadBalancer = (props: CombinedProps) => {
  const path = props.match.path;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={RouteCreate} path="/loadbalancers/routes/create" />
        <Route
          component={EntryPointCreate}
          path="/loadbalancers/entrypoints/create"
        />
        <Route component={LoadBalancerCreate} path="/loadbalancers/create" />
        <Route component={LoadBalancerDetail} path={`${path}/:id/:tab`} />
        <Route component={LoadBalancerLanding} path="/loadbalancers/:tab?" />
      </Switch>
    </React.Suspense>
  );
};

export default LoadBalancer;
