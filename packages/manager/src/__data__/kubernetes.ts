import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { pool1 } from 'src/__data__/nodePools';

export const clusters: KubernetesCluster[] = [
  {
    region: 'us-central',
    label: 'cluster-1',
    created: '2019-04-29 18:02:17',
    updated: '2019-04-29 18:02:17',
    id: 35,
    status: 'running',
    k8s_version: '1.13.5',
    tags: [],
  },
  {
    region: 'us-central',
    label: 'cluster-2',
    created: '2019-04-29 18:02:17',
    updated: '2019-04-29 18:02:17',
    id: 34,
    status: 'running',
    k8s_version: '1.13.5',
    tags: [],
  },
];

export const extendedClusters = clusters.map(cluster => {
  return {
    ...cluster,
    node_pools: [pool1],
    totalMemory: 10,
    totalCPU: 2,
    totalStorage: 10,
  };
});
