import * as React from 'react';
import {
  withRouter,
  Route,
  Switch,
  RouteComponentProps,
} from 'react-router-dom';
import DefaultLoader from 'src/components/DefaultLoader';

const NodeBalancersLanding = DefaultLoader({
  loader: () => import('./NodeBalancersLanding'),
});

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const { match: { path } } = this.props;

    return (
      <Switch>
        <Route component={NodeBalancersLanding} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(NodeBalancers);
