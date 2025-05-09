import { Factory } from '@linode/utilities';

import type {
  ControlPlaneACLOptions,
  KubeNodePoolResponse,
  KubeNodePoolResponseBeta,
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesDashboardResponse,
  KubernetesEndpointResponse,
  KubernetesTieredVersion,
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
  labels: {},
  nodes: kubeLinodeFactory.buildList(3),
  tags: [],
  taints: [
    {
      effect: 'NoExecute',
      key: 'example.com/my-app',
      value: 'my-taint',
    },
  ],
  type: 'g6-standard-1',
});

export const nodePoolBetaFactory =
  Factory.Sync.makeFactory<KubeNodePoolResponseBeta>({
    autoscaler: {
      enabled: false,
      max: 1,
      min: 1,
    },
    count: 3,
    disk_encryption: 'enabled',
    id: Factory.each((id) => id),
    labels: {},
    nodes: kubeLinodeFactory.buildList(3),
    tags: [],
    taints: [
      {
        effect: 'NoExecute',
        key: 'example.com/my-app',
        value: 'my-taint',
      },
    ],
    type: 'g6-standard-1',
    firewall_id: 0,
    k8s_version: 'v1.31.1+lke4',
    update_strategy: 'on_recycle',
  });

export const kubernetesClusterFactory =
  Factory.Sync.makeFactory<KubernetesCluster>({
    control_plane: { high_availability: true },
    created: '2020-04-08T16:58:21',
    id: Factory.each((id) => id),
    k8s_version: '1.21',
    label: Factory.each((i) => `cluster-${i}`),
    region: 'us-central',
    status: 'ready',
    tags: [],
    updated: '2020-04-08T16:58:21',
  });

export const kubeEndpointFactory =
  Factory.Sync.makeFactory<KubernetesEndpointResponse>({
    endpoint: `https://${crypto.randomUUID && crypto.randomUUID()}`,
  });

export const kubernetesDashboardUrlFactory =
  Factory.Sync.makeFactory<KubernetesDashboardResponse>({
    url: `https://${crypto.randomUUID && crypto.randomUUID()}`,
  });

export const kubernetesAPIResponse =
  Factory.Sync.makeFactory<KubernetesCluster>({
    control_plane: { high_availability: true },
    created: '2020-04-08T16:58:21',
    id: Factory.each((id) => id),
    k8s_version: '1.21',
    label: Factory.each((i) => `test-cluster-${i}`),
    region: 'us-central',
    status: 'ready',
    tags: [],
    updated: '2020-04-08T16:58:21',
  });

export const kubernetesVersionFactory =
  Factory.Sync.makeFactory<KubernetesVersion>({
    id: Factory.each((id) => `1.3${id}`),
  });

export const kubernetesStandardTierVersionFactory =
  Factory.Sync.makeFactory<KubernetesTieredVersion>({
    id: Factory.each((id) => `v1.3${id}`),
    tier: 'standard',
  });

export const kubernetesEnterpriseTierVersionFactory =
  Factory.Sync.makeFactory<KubernetesTieredVersion>({
    id: Factory.each((id) => `v1.31.${id}+lke1`),
    tier: 'enterprise',
  });

export const kubernetesControlPlaneACLOptionsFactory =
  Factory.Sync.makeFactory<ControlPlaneACLOptions>({
    addresses: {
      ipv4: ['10.0.0.0/24', '10.0.1.0/24'],
      ipv6: ['8e61:f9e9:8d40:6e0a:cbff:c97a:2692:827e'],
    },
    enabled: true,
    'revision-id': '67497a9c5fc8491889a7ef8107493e92',
  });

export const kubernetesControlPlaneACLFactory =
  Factory.Sync.makeFactory<KubernetesControlPlaneACLPayload>({
    acl: {
      ...kubernetesControlPlaneACLOptionsFactory.build(),
    },
  });
