import * as React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const KubernetesLanding = React.lazy(() => import('./KubernetesLanding'));
const ClusterDetail = React.lazy(() => import('./KubernetesClusterDetail'));
const ClusterCreate = React.lazy(() => import('./CreateCluster'));

const Kubernetes: React.FC = () => {
  const { path } = useRouteMatch();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ClusterCreate} path={`${path}/create`} exact strict />
        <Redirect
          from={`${path}/clusters/:clusterID/summary`}
          to={`${path}/clusters/:clusterID`}
        />
        <Route
          component={ClusterDetail}
          path={`${path}/clusters/:clusterID`}
          exact
          strict
        />
        <Route
          component={KubernetesLanding}
          path={`${path}/clusters`}
          exact
          strict
        />
        <Redirect to={`${path}/clusters`} />
      </Switch>
    </React.Suspense>
  );
};

export default Kubernetes;
