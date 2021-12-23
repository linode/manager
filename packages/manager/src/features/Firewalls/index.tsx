import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useReduxLoad from 'src/hooks/useReduxLoad';

const FirewallLanding = React.lazy(() => import('./FirewallLanding'));
const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

const Firewall: React.FC = () => {
  const { path } = useRouteMatch();
  useReduxLoad(['firewalls']);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={FirewallLanding} path={`${path}/create`} />
        <Route component={FirewallDetail} path={`${path}/:id`} />
        <Route component={FirewallLanding} exact strict />
      </Switch>
    </React.Suspense>
  );
};

export default Firewall;
