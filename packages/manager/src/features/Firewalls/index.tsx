import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import SuspenseLoader from 'src/components/SuspenseLoader';
import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';

const FirewallLanding = React.lazy(() => import('./FirewallLanding'));
const FirewallDetail = React.lazy(() => import('./FirewallDetail'));

type Props = RouteComponentProps<{}>;

type CombinedProps = Props & FireProps;

class Firewall extends React.Component<CombinedProps> {
  componentDidMount() {
    // @todo refactor to use useReduxLoad when that is available in develop
    const { getFirewalls, lastUpdated, loading } = this.props;
    if (lastUpdated === 0 && !loading) {
      getFirewalls();
    }
  }

  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <React.Fragment>
          <DocumentTitleSegment segment="Firewalls" />
          <Switch>
            <Route exact path={`${path}`} component={FirewallLanding} />
            <Route path={`${path}/:id`} component={FirewallDetail} />
            <Route component={FirewallLanding} />
          </Switch>
        </React.Fragment>
      </React.Suspense>
    );
  }
}

export default withFirewalls()(Firewall);
