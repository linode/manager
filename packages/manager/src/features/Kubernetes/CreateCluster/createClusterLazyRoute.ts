import { createLazyRoute } from '@tanstack/react-router';

import { CreateCluster } from 'src/features/Kubernetes/CreateCluster/CreateCluster';

export const createClusterLazyRoute = createLazyRoute('/kubernetes/create')({
  component: CreateCluster,
});
