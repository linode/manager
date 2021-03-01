import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const NodeBalancerDetail = React.lazy(() => import('./NodeBalancerDetail'));
const NodeBalancersLanding = React.lazy(() => import('./NodeBalancersLanding'));
const NodeBalancerCreate = React.lazy(() => import('./NodeBalancerCreate'));

type Props = RouteComponentProps<{}>;

class NodeBalancers extends React.Component<Props> {
  render() {
    const {
      match: { path },
    } = this.props;

    return (
      <React.Suspense fallback={<SuspenseLoader />}>
        <Switch>
          <Route component={NodeBalancersLanding} path={path} exact />
          <Route component={NodeBalancerCreate} path={`${path}/create`} exact />
          <Route
            component={NodeBalancerDetail}
            path={`${path}/:nodeBalancerId`}
          />
        </Switch>
      </React.Suspense>
    );
  }
}

export default withRouter(NodeBalancers);
