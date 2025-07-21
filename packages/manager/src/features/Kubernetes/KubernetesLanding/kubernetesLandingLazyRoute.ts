import { createLazyRoute } from '@tanstack/react-router';

import { KubernetesLanding } from 'src/features/Kubernetes/KubernetesLanding/KubernetesLanding';

export const kubernetesLandingLazyRoute = createLazyRoute(
  '/kubernetes/clusters'
)({
  component: KubernetesLanding,
});
