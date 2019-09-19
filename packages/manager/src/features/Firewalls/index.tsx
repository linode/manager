import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const FirewallLanding = DefaultLoader({
  loader: () => import('./FirewallLanding')
});

type Props = RouteComponentProps<{}>;

class Firewall extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route exact path={`${path}`} component={FirewallLanding} />
        <Route component={FirewallLanding} />
      </Switch>
    );
  }
}

export default Firewall;
