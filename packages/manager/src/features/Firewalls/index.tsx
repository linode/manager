import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import withFirewalls, {
  Props as FireProps
} from 'src/containers/firewalls.container';

const FirewallLanding = DefaultLoader({
  loader: () => import('./FirewallLanding')
});

const FirewallDetail = DefaultLoader({
  loader: () => import('./FirewallDetail')
});

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
      <React.Fragment>
        <DocumentTitleSegment segment="Firewalls" />
        <Switch>
          <Route exact path={`${path}`} component={FirewallLanding} />
          <Route path={`${path}/:id`} component={FirewallDetail} />
          <Route component={FirewallLanding} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default withFirewalls()(Firewall);
