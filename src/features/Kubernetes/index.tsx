import * as React from 'react';
import {
  Route,
  RouteComponentProps,
  Switch,
  withRouter
} from 'react-router-dom';

import DefaultLoader from 'src/components/DefaultLoader';

const ClusterList = DefaultLoader({
  loader: () => import('./ClusterList')
});

const ClusterCreate = DefaultLoader({
  loader: () => import('./CreateCluster')
});

type Props = RouteComponentProps<{}>;

class KubernetesRoutes extends React.Component<Props> {
  render() {
    const {
      match: { path }
    } = this.props;

    return (
      <Switch>
        <Route component={ClusterCreate} path={`${path}/create`} />
        {/* <Route component={ClusterDetail} path={`${path}/:linodeId`} /> */}
        <Route component={ClusterList} path={path} exact />
      </Switch>
    );
  }
}

export default withRouter(KubernetesRoutes);
