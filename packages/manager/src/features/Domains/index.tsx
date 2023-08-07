import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { SuspenseLoader } from 'src/components/SuspenseLoader';

const DomainCreate = React.lazy(() =>
  import('./CreateDomain/CreateDomain').then((module) => ({
    default: module.CreateDomain,
  }))
);
const DomainsLanding = React.lazy(() =>
  import('./DomainsLanding').then((module) => ({
    default: module.DomainsLanding,
  }))
);
const DomainDetail = React.lazy(() =>
  import('./DomainDetail').then((module) => ({
    default: module.DomainDetailRouting,
  }))
);

export const DomainsRoutes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={DomainCreate} exact path="/domains/create" />
        <Route
          component={DomainDetail}
          exact
          path="/domains/:domainId/records"
          strict
        />
        <Route
          component={DomainDetail}
          exact
          path="/domains/:domainId"
          strict
        />
        <Route component={DomainsLanding} exact path="/domains" strict />
        <Redirect to="/domains" />
      </Switch>
    </React.Suspense>
  );
};
