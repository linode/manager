import * as React from 'react';
import {
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const KubernetesLanding = DefaultLoader({
  loader: () => import('./KubernetesLanding')
});

const ClusterCreate = DefaultLoader({
  loader: () => import('./CreateCluster')
});

const ClusterDetail = DefaultLoader({
  loader: () => import('./KubernetesClusterDetail')
});

type Props = RouteComponentProps<{}>;

class Kubernetes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ClusterCreate} exact path={`${path}/create`} />
        <Route component={ClusterDetail} exact path={`${path}/clusters/:clusterID`} />
        <Route component={KubernetesLanding} exact path={path} />
        <Redirect to={'/kubernetes'} />
      </Switch>
    );
  }
}

export default withRouter(Kubernetes);
