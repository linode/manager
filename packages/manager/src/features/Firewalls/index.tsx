import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';

const FirewallLanding = DefaultLoader({
  loader: () => import('./FirewallLanding')
});

const FirewallDetail = DefaultLoader({
  loader: () => import('./FirewallDetail')
});

type Props = RouteComponentProps<{}>;

class Firewall extends React.Component<Props> {
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

export default Firewall;
