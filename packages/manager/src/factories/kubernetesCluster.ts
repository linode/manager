import {
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesVersion,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes/types';
import * as Factory from 'factory.ts';
import { v4 } from 'uuid';

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
    endpoint: `https://${v4()}`,
  }
);

export const kubernetesDashboardUrlFactory = Factory.Sync.makeFactory<KubernetesDashboardResponse>(
  {
    url: `https://${v4()}`,
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
