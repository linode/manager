import { LinodeType } from 'linode-js-sdk/lib/linodes'
import { ExtendedCluster, ExtendedPoolNode, PoolNodeWithPrice } from './types';

export const getMonthlyPrice = (
  type: string,
  count: number,
  types: LinodeType[]
) => {
  if (!types) {
    return 0;
  }
  const thisType = types.find((t: LinodeType) => t.id === type);
  return thisType ? thisType.price.monthly * count : 0;
};

export const getTotalClusterPrice = (pools: PoolNodeWithPrice[]) =>
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
  pools: ExtendedPoolNode[],
  types: LinodeType[]
): ExtendedCluster => {
  // Identify which pools belong to this cluster and add pricing information.
  const _pools = pools.reduce((accumulator, thisPool) => {
    return thisPool.clusterID === cluster.id
      ? [
          ...accumulator,
          {
            ...thisPool,
            totalMonthlyPrice: getMonthlyPrice(
              thisPool.type,
              thisPool.count,
              types
            )
          }
        ]
      : accumulator;
  }, []);
  const { CPU, RAM } = getTotalClusterMemoryAndCPU(_pools, types);
  return {
    ...cluster,
    node_pools: _pools,
    totalMemory: RAM,
    totalCPU: CPU
  };
};

interface ClusterData {
  CPU: number;
  RAM: number;
}

export const getTotalClusterMemoryAndCPU = (
  pools: ExtendedPoolNode[],
  types: LinodeType[]
) => {
  if (!types || !pools) {
    return { RAM: 0, CPU: 0 };
  }

  return pools.reduce(
    (accumulator: ClusterData, thisPool: ExtendedPoolNode) => {
      const thisType = types.find(
        (type: LinodeType) => type.id === thisPool.type
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
