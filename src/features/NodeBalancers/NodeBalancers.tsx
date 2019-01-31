import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const NodeBalancerDetail = DefaultLoader({
  loader: () => import('./NodeBalancerDetail')
});

const NodeBalancersLanding = DefaultLoader({
  loader: () => import('./NodeBalancersLanding')
});

const NodeBalancerCreate = DefaultLoader({
  loader: () => import('./NodeBalancerCreate')
});

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={NodeBalancersLanding} path={path} exact />
        <Route component={NodeBalancerCreate} path={`${path}/create`} exact />
        <Route
          component={NodeBalancerDetail}
          path={`${path}/:nodeBalancerId`}
        />
      </Switch>
    );
  }
}

export default withRouter(NodeBalancers);
