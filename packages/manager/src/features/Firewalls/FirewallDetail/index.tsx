import * as React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';

const FirewallRules = DefaultLoader({
  loader: () => import('./FirewallRulesLanding')
});

const FirewallLinodes = DefaultLoader({
  loader: () => import('./FirewallLinodesLanding')
});

type Props = RouteComponentProps<{}>;

class FirewallDetail extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <React.Fragment>
        <Switch>
          <Route exact path={`${path}/rules`} component={FirewallRules} />
          <Route exact path={`${path}/linodes`} component={FirewallLinodes} />
          <Route component={FirewallRules} />
        </Switch>
      </React.Fragment>
    );
  }
}

export default FirewallDetail;
