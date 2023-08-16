import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const FirewallLanding = React.lazy(
  () => import('./FirewallLanding/FirewallLanding')
);

const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

const Firewall = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Firewalls" />
        <Switch>
          <Route component={FirewallLanding} exact path={`${path}(/create)?`} />
          <Route component={FirewallDetail} path={`${path}/:id/:tab?`} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Firewall;
