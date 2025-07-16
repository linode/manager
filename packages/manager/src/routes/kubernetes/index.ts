import { createRoute, redirect } from '@tanstack/react-router';

import { rootRoute } from '../root';
import { KubernetesRoute } from './KubernetesRoute';

export const kubernetesRoute = createRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/kubernetes') {
      throw redirect({
        to: '/kubernetes/clusters',
      });
    }
  },
  component: KubernetesRoute,
  getParentRoute: () => rootRoute,
  path: 'kubernetes',
});

const kubernetesIndexRoute = createRoute({
  getParentRoute: () => kubernetesRoute,
  path: '/',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesLanding/kubernetesLandingLazyRoute'
  ).then((m) => m.kubernetesLandingLazyRoute)
);

const kubernetesClustersRoute = createRoute({
  getParentRoute: () => kubernetesRoute,
  path: 'clusters',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesLanding/kubernetesLandingLazyRoute'
  ).then((m) => m.kubernetesLandingLazyRoute)
);

const kubernetesCreateRoute = createRoute({
  getParentRoute: () => kubernetesRoute,
  path: 'create',
}).lazy(() =>
  import('src/features/Kubernetes/CreateCluster/createClusterLazyRoute').then(
    (m) => m.createClusterLazyRoute
  )
);

const kubernetesClusterDetailRoute = createRoute({
  getParentRoute: () => kubernetesRoute,
  parseParams: (params) => ({
    clusterId: Number(params.clusterId),
  }),
  path: 'clusters/$clusterId',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesClusterDetail/kubernetesClusterDetailLazyRoute'
  ).then((m) => m.kubernetesClusterDetailLazyRoute)
);

const kubernetesClusterDetailSummaryRoute = createRoute({
  getParentRoute: () => kubernetesClusterDetailRoute,
  path: 'summary',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesClusterDetail/kubernetesClusterDetailLazyRoute'
  ).then((m) => m.kubernetesClusterDetailLazyRoute)
);

const kubernetesClustersDeleteRoute = createRoute({
  getParentRoute: () => kubernetesRoute,
  path: 'clusters/$clusterID/delete',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesLanding/kubernetesLandingLazyRoute'
  ).then((m) => m.kubernetesLandingLazyRoute)
);

const kubernetesClustersSummaryDeleteRoute = createRoute({
  getParentRoute: () => kubernetesClusterDetailRoute,
  path: 'summary/delete',
}).lazy(() =>
  import(
    'src/features/Kubernetes/KubernetesClusterDetail/kubernetesClusterDetailLazyRoute'
  ).then((m) => m.kubernetesClusterDetailLazyRoute)
);

export const kubernetesRouteTree = kubernetesRoute.addChildren([
  kubernetesIndexRoute,
  kubernetesClustersRoute.addChildren([kubernetesClustersDeleteRoute]),
  kubernetesClusterDetailRoute.addChildren([
    kubernetesClusterDetailSummaryRoute,
    kubernetesClustersSummaryDeleteRoute,
  ]),
  kubernetesCreateRoute,
]);
