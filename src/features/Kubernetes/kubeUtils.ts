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
      : accumulator + node.totalMonthlyPrice;
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
  return {
    ...cluster,
    node_pools: pools,
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
  if (!types || !pools) {
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
