import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

const KubernetesLanding = React.lazy(() => import('./KubernetesLanding'));

const ClusterCreate = React.lazy(() => import('./CreateCluster'));

const ClusterDetail = React.lazy(() => import('./KubernetesClusterDetail'));

type Props = RouteComponentProps<{}>;

class Kubernetes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ClusterCreate} exact path={`${path}/create`} />
        <Route
          component={ClusterDetail}
          exact
          path={`${path}/clusters/:clusterID/summary`}
        />
        <Route
          path={`${path}/clusters/:clusterID`}
          render={props => (
            <Redirect
              to={`${path}/clusters/${props.match.params.clusterID}/summary`}
            />
          )}
        />
        <Route component={KubernetesLanding} exact path={`${path}/clusters`} />
        <Redirect to={'/kubernetes/clusters'} />
      </Switch>
    );
  }
}

export default withRouter(Kubernetes);
