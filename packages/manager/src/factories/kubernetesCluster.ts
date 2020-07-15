import * as Factory from 'factory.ts';
import {
  KubernetesEndpointResponse,
  PoolNodeResponse
} from '@linode/api-v4/lib/kubernetes/types';
import {
  ExtendedCluster,
  PoolNodeWithPrice
} from 'src/features/Kubernetes/types';
import { v4 } from 'uuid';

/**
 * These factories work with the "extended" types used in our logic.
 * Separate factories will be needed to work with API response types,
 * or typing will have to be adjusted to combine the 2.
 *
 * It looks like factory.ts does not allow you to override the type when
 * extending a factory. If we could do:
 *
 * baseClusterFactory = makeFactory<KubernetesCluster>(...)
 * extendedClusterFactory = baseClusterFactory.extend<ExtendedCluster>(...)
 *
 * ...we would be set.
 */

export const kubeLinodeFactory = Factory.Sync.makeFactory<PoolNodeResponse>({
  id: Factory.each(id => `id-${id}`),
  instance_id: Factory.each(id => id),
  status: 'ready'
});

export const _nodePoolFactory = Factory.Sync.makeFactory<PoolNodeWithPrice>({
  id: Factory.each(id => id),
  count: 3,
  type: 'g5-standard-1',
  totalMonthlyPrice: 1000
});

export const nodePoolFactory = _nodePoolFactory.withDerivation1(
  ['count'],
  'nodes',
  (count: number) => {
    const linodes = [];
    let i = 0;
    for (i; i < count; i++) {
      linodes.push(kubeLinodeFactory.build());
    }
    return linodes;
  }
);

export const kubernetesClusterFactory = Factory.Sync.makeFactory<
  ExtendedCluster
>({
  id: Factory.each(id => id),
  created: '2020-04-08T16:58:21',
  updated: '2020-04-08T16:58:21',
  region: 'us-central',
  status: 'ready',
  label: Factory.each(i => `test-cluster-${i}`),
  k8s_version: '1.17',
  node_pools: nodePoolFactory.buildList(2),
  totalMemory: 1000,
  totalCPU: 4,
  totalStorage: 1000,
  tags: []
});

export const kubeEndpointFactory = Factory.Sync.makeFactory<
  KubernetesEndpointResponse
>({
  endpoint: `https://${v4()}`
});
