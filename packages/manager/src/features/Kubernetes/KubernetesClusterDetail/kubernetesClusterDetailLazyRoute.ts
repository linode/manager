import { createLazyRoute } from '@tanstack/react-router';

import { KubernetesClusterDetail } from 'src/features/Kubernetes/KubernetesClusterDetail/KubernetesClusterDetail';

export const kubernetesClusterDetailLazyRoute = createLazyRoute(
  '/kubernetes/clusters/$clusterId'
)({
  component: KubernetesClusterDetail,
});
