import { contains, groupBy } from 'ramda';

import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ExtendedCluster, ExtendedPoolNode, PoolNode } from './types';

// @todo don't hard code this
export const KubernetesVersionOptions = ['1.13', '1.14'].map(version => ({
  label: version,
  value: version
}));

export const getMonthlyPrice = (
  type: string,
  count: number,
  types: ExtendedType[]
) => {
  if (!types) {
    return 0;
  }
  const thisType = types.find((t: ExtendedType) => t.id === type);
  return thisType ? thisType.price.monthly * count : 0;
};

export const getTotalClusterPrice = (pools: ExtendedPoolNode[]) =>
  pools.reduce((accumulator, node) => {
    return node.queuedForDeletion
      ? accumulator // If we're going to delete it, don't include it in the cost
      : accumulator + node.totalMonthlyPrice * node.count;
  }, 0);

/**
 * Usually when displaying or editing clusters, we need access
 * to pricing information as well as statistics, which aren't
 * returned from the API and must be computed.
 */
export const extendCluster = (
  cluster: Linode.KubernetesCluster,
  types: ExtendedType[]
): ExtendedCluster => {
  const pools = responseToExtendedNodePool(cluster.node_pools, types);
  const { CPU, RAM } = getTotalClusterMemoryAndCPU(pools, types);

  console.log(pools);
  const price = getTotalClusterPrice(pools);
  return {
    ...cluster,
    node_pools: pools,
    price,
    totalMemory: RAM,
    totalCPU: CPU
  };
};

interface ClusterData {
  CPU: number;
  RAM: number;
}

export const getTotalClusterMemoryAndCPU = (
  pools: PoolNode[],
  types: ExtendedType[]
) => {
  if (!types) {
    return { RAM: 0, CPU: 0 };
  }
  return pools.reduce(
    (accumulator: ClusterData, thisPool: PoolNode) => {
      const thisType = types.find(
        (type: ExtendedType) => type.id === thisPool.type
      );
      if (!thisType) {
        return accumulator;
      }
      return {
        RAM: accumulator.RAM + thisType.memory * thisPool.count,
        CPU: accumulator.CPU + thisType.vcpus * thisPool.count
      };
    },
    { RAM: 0, CPU: 0 }
  );
};

export const responseToExtendedNodePool = (
  pools: Linode.KubeNodePoolResponse[],
  types: ExtendedType[]
): ExtendedPoolNode[] => {
  return pools.map(thisPool => ({
    id: thisPool.id,
    count: thisPool.count,
    type: thisPool.type,
    totalMonthlyPrice: getMonthlyPrice(thisPool.type, thisPool.count, types)
  }));
};

/** getPoolUpdateGroups
 *
 * Separates a set of node pools into categories.
 *
 * @param pools: The list of pools in local state. These may be in any of the following categories:
 *  - Unchanged: user hasn't typed any input.
 *  - To be deleted: existing node pools that need to be deleted through the API
 *  - Updated: User has changed the node_count value through the form.
 *  - To be added: new node in local state to be created through the API.
 *
 * @param propsPools: this reflects the current state of the cluster, as reported by the API.
 *  This prop is used for determining if a node pool has been updated. Doing a deep comparison
 *  check in this helper is simpler and more efficient than comparing on every user input to
 *  see if a value differs from the static state.
 *
 * Returns an object with the following shape:
 *
 * {
 *  'add': [list, of, pools, to, add],
 *  'update': [same, here],
 *  'delete': [same, here],
 *  'unchanged': [same, here]
 * }
 *
 * NOTE: If a particular group is empty, that property will _not_ exist in the resulting object.
 * Use safe object access.
 */
export const getPoolUpdateGroups = (
  pools: ExtendedPoolNode[],
  propsPools: ExtendedPoolNode[]
) =>
  groupBy((thisPool: ExtendedPoolNode) => {
    return thisPool.queuedForAddition
      ? 'add'
      : thisPool.queuedForDeletion
      ? 'delete'
      : contains(thisPool, propsPools)
      ? 'unchanged'
      : 'update';
  }, pools);
