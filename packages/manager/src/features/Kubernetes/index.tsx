import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { SuspenseLoader } from 'src/components/SuspenseLoader';

const KubernetesLanding = React.lazy(() =>
  import('./KubernetesLanding/KubernetesLanding').then((module) => ({
    default: module.KubernetesLanding,
  }))
);

const ClusterCreate = React.lazy(() =>
  import('./CreateCluster/CreateCluster').then((module) => ({
    default: module.CreateCluster,
  }))
);

const KubernetesClusterDetail = React.lazy(() =>
  import('./KubernetesClusterDetail/KubernetesClusterDetail').then(
    (module) => ({
      default: module.KubernetesClusterDetail,
    })
  )
);

export const Kubernetes = () => {
  return (
    <React.Suspense fallback={<SuspenseLoader />}>
      <ProductInformationBanner bannerLocation="Kubernetes" />
      <Switch>
        <Route component={ClusterCreate} path={`/kubernetes/create`} />
        <Route
          component={KubernetesClusterDetail}
          exact
          path={`/kubernetes/clusters/:clusterID/summary`}
        />
        <Route
          render={(props) => (
            <Redirect
              to={`/kubernetes/clusters/${props.match.params.clusterID}/summary`}
            />
          )}
          path={`/kubernetes/clusters/:clusterID`}
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
