import * as React from 'react';
import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import SuspenseLoader from 'src/components/SuspenseLoader';

const KubernetesLanding = React.lazy(() => import('./KubernetesLanding'));
const ClusterDetail = React.lazy(() => import('./KubernetesClusterDetail'));
const ClusterCreate = React.lazy(() => import('./CreateCluster'));

const Kubernetes: React.FC = () => {
  const { path } = useRouteMatch();
  const { clusterID } = useParams<{ clusterID: string }>();

  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <Switch>
        <Route component={ClusterCreate} path={`${path}/create`} />
        <Route
          component={ClusterDetail}
          path={`${path}/clusters/:clusterID/summary`}
        />
        <Route
          path={`${path}/clusters/:clusterID`}
          render={() => (
            <Redirect to={`${path}/clusters/${clusterID}/summary`} />
          )}
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
