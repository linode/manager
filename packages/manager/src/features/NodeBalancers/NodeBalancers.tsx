import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const NodeBalancersLanding = React.lazy(() => import('./NodeBalancersLanding'));
const NodeBalancerDetail = React.lazy(() => import('./NodeBalancerDetail'));
const NodeBalancerCreate = React.lazy(() => import('./NodeBalancerCreate'));

export const NodeBalancers: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={NodeBalancerCreate} path={`${path}/create`} />
        <Route
          component={NodeBalancerDetail}
          path={`${path}/:nodeBalancerId`}
        />
        <Route component={NodeBalancersLanding} path={path} exact strict />
        <Redirect to={path} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(NodeBalancers);
