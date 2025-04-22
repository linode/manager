import { createLazyRoute } from '@tanstack/react-router';

import { CreateCluster } from 'src/features/Kubernetes/CreateCluster/CreateCluster';
import { KubernetesClusterDetail } from 'src/features/Kubernetes/KubernetesClusterDetail/KubernetesClusterDetail';
import { KubernetesLanding } from 'src/features/Kubernetes/KubernetesLanding/KubernetesLanding';

export const kubernetesLandingLazyRoute = createLazyRoute(
  '/kubernetes/clusters'
)({
  component: KubernetesLanding,
});

export const createClusterLazyRoute = createLazyRoute('/kubernetes/create')({
  component: CreateCluster,
});

export const kubernetesClusterDetailLazyRoute = createLazyRoute(
  '/kubernetes/clusters/$clusterID'
)({
  component: KubernetesClusterDetail,
});
