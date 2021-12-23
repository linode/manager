import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useRouteMatch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const DomainsLanding = React.lazy(() => import('./DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));
const DomainCreate = React.lazy(() => import('./CreateDomain'));

const DomainsRoutes: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={DomainCreate} path={`${path}/create`} exact />
        <Route
          component={DomainDetail}
          path={`${path}/:domainId/records`}
          exact
          strict
        />
        <Route
          component={DomainDetail}
          path={`${path}/:domainId`}
          exact
          strict
        />
        <Route component={DomainsLanding} path={path} exact strict />
        <Redirect to={path} />
      </Switch>
    </React.Suspense>
  );
};

export default withRouter(DomainsRoutes);
