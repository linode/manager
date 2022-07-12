import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const DomainCreate = React.lazy(() => import('./CreateDomain'));
const DomainsLanding = React.lazy(() => import('./DomainsLanding'));
const DomainDetail = React.lazy(() => import('./DomainDetail'));

const DomainsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={DomainCreate} exact path="/domains/create" />
        <Route
          path="/domains/:domainId/records"
          exact
          strict
          component={DomainDetail}
        />
        <Route
          path="/domains/:domainId"
          exact
          strict
          component={DomainDetail}
        />
        <Route component={DomainsLanding} path="/domains" exact strict />
        <Redirect to="/domains" />
      </Switch>
    </React.Suspense>
  );
};

export default DomainsRoutes;
