import * as Factory from 'factory.ts';
import {
  KubernetesCluster,
  KubernetesEndpointResponse,
  KubeNodePoolResponse,
  PoolNodeResponse,
  KubernetesVersion,
} from '@linode/api-v4/lib/kubernetes/types';
import { v4 } from 'uuid';

export const kubeLinodeFactory = Factory.Sync.makeFactory<PoolNodeResponse>({
  id: Factory.each((id) => `id-${id}`),
  instance_id: Factory.each((id) => id),
  status: 'ready',
});

export const nodePoolFactory = Factory.Sync.makeFactory<KubeNodePoolResponse>({
  id: Factory.each((id) => id),
  count: 3,
  type: 'g6-standard-1',
  nodes: kubeLinodeFactory.buildList(3),
  autoscaler: {
    enabled: false,
    min: 1,
    max: 1,
  },
});

export const kubernetesClusterFactory = Factory.Sync.makeFactory<KubernetesCluster>(
  {
    id: Factory.each((id) => id),
    created: '2020-04-08T16:58:21',
    updated: '2020-04-08T16:58:21',
    region: 'us-central',
    status: 'ready',
    label: Factory.each((i) => `cluster-${i}`),
    k8s_version: '1.21',
    tags: [],
    control_plane: { high_availability: true },
  }
);

export const kubeEndpointFactory = Factory.Sync.makeFactory<KubernetesEndpointResponse>(
  {
    endpoint: `https://${v4()}`,
  }
);

export const kubernetesAPIResponse = Factory.Sync.makeFactory<KubernetesCluster>(
  {
    id: Factory.each((id) => id),
    created: '2020-04-08T16:58:21',
    updated: '2020-04-08T16:58:21',
    region: 'us-central',
    status: 'ready',
    label: Factory.each((i) => `test-cluster-${i}`),
    k8s_version: '1.21',
    tags: [],
    control_plane: { high_availability: true },
  }
);

export const kubernetesVersionFactory = Factory.Sync.makeFactory<KubernetesVersion>(
  {
    id: '1.24',
  }
);
