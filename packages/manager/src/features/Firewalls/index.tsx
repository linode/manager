import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useReduxLoad from 'src/hooks/useReduxLoad';

const FirewallLanding = React.lazy(() => import('./FirewallLanding'));

const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const Firewall: React.FC<CombinedProps> = props => {
  const {
    match: { path },
  } = props;

  useReduxLoad(['firewalls']);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Firewalls" />
        <Switch>
          <Route exact path={`${path}(/create)?`} component={FirewallLanding} />
          <Route path={`${path}/:id`} component={FirewallDetail} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Firewall;
