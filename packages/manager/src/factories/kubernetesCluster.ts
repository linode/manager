import Factory from 'src/factories/factoryProxy';

import type {
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesVersion,
  PoolNodeResponse,
} from '@linode/api-v4';

export const kubeLinodeFactory = Factory.Sync.makeFactory<PoolNodeResponse>({
  id: Factory.each((id) => `id-${id}`),
  instance_id: Factory.each((id) => id),
  status: 'ready',
});

export const nodePoolFactory = Factory.Sync.makeFactory<KubeNodePoolResponse>({
  autoscaler: {
    enabled: false,
    max: 1,
    min: 1,
  },
  count: 3,
  disk_encryption: 'enabled',
  id: Factory.each((id) => id),
  nodes: kubeLinodeFactory.buildList(3),
  type: 'g6-standard-1',
});

export const kubernetesClusterFactory = Factory.Sync.makeFactory<KubernetesCluster>(
  {
    control_plane: { high_availability: true },
    created: '2020-04-08T16:58:21',
    id: Factory.each((id) => id),
    k8s_version: '1.21',
    label: Factory.each((i) => `cluster-${i}`),
    region: 'us-central',
    status: 'ready',
    tags: [],
    updated: '2020-04-08T16:58:21',
  }
);

export const kubeEndpointFactory = Factory.Sync.makeFactory<KubernetesEndpointResponse>(
  {
    endpoint: `https://${crypto.randomUUID()}`,
  }
);

export const kubernetesDashboardUrlFactory = Factory.Sync.makeFactory<KubernetesDashboardResponse>(
  {
    url: `https://${crypto.randomUUID()}`,
  }
);

export const kubernetesAPIResponse = Factory.Sync.makeFactory<KubernetesCluster>(
  {
    control_plane: { high_availability: true },
    created: '2020-04-08T16:58:21',
    id: Factory.each((id) => id),
    k8s_version: '1.21',
    label: Factory.each((i) => `test-cluster-${i}`),
    region: 'us-central',
    status: 'ready',
    tags: [],
    updated: '2020-04-08T16:58:21',
  }
);

export const kubernetesVersionFactory = Factory.Sync.makeFactory<KubernetesVersion>(
  {
    id: '1.24',
  }
);
