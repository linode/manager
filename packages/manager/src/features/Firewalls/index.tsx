import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import useFlags from 'src/hooks/useFlags';
import useReduxLoad from 'src/hooks/useReduxLoad';

const FirewallLanding = React.lazy(() => import('./FirewallLanding'));
const FirewallLanding_CMR = React.lazy(() =>
  import('./FirewallLanding/FirewallLanding_CMR')
);
const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props;

const Firewall: React.FC<CombinedProps> = props => {
  const {
    match: { path }
  } = props;

  const flags = useFlags();
  useReduxLoad(['firewalls']);

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <React.Fragment>
        <DocumentTitleSegment segment="Firewalls" />
        <Switch>
          <Route
            exact
            path={`${path}`}
            component={flags.cmr ? FirewallLanding_CMR : FirewallLanding}
          />
          <Route path={`${path}/:id`} component={FirewallDetail} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    </React.Suspense>
  );
};

export default Firewall;
