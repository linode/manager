import * as React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const FirewallLanding = React.lazy(
  () => import('./FirewallLanding/FirewallLanding')
);

const FirewallDetail = React.lazy(() =>
  import('./FirewallDetail').then((module) => ({
    default: module.FirewallDetail,
  }))
);

const Firewall = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <ProductInformationBanner bannerLocation="Firewalls" />
        <Switch>
          <Route component={FirewallLanding} exact path={`${path}/create`} />
          <Route component={FirewallDetail} path={`${path}/:id/:tab?`} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Firewall;
