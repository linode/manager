import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const FirewallLanding = React.lazy(
  () => import('./FirewallLanding/FirewallLanding')
);

const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

type Props = RouteComponentProps<{}>;

const Firewall = (props: Props) => {
  const {
    match: { path },
  } = props;

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Firewalls" />
        <Switch>
          <Route component={FirewallLanding} exact path={`${path}(/create)?`} />
          <Route component={FirewallDetail} path={`${path}/:id`} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Firewall;
