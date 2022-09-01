import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const KubernetesLanding = React.lazy(() => import('./KubernetesLanding'));
const ClusterCreate = React.lazy(() => import('./CreateCluster'));
const ClusterDetail = React.lazy(() => import('./KubernetesClusterDetail'));

const Kubernetes: React.FC = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ClusterCreate} path={`/kubernetes/create`} />
        <Route
          component={ClusterDetail}
          exact
          path={`/kubernetes/clusters/:clusterID/summary`}
        />
        <Route
          path={`/kubernetes/clusters/:clusterID`}
          render={(props) => (
            <Redirect
              to={`/kubernetes/clusters/${props.match.params.clusterID}/summary`}
            />
          )}
        />
        <Route
          component={KubernetesLanding}
          exact
          path={`/kubernetes/clusters`}
        />
        <Redirect to={'/kubernetes/clusters'} />
      </Switch>
    </React.Suspense>
  );
};

export default Kubernetes;
