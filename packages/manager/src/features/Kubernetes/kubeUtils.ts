import {
  KubernetesCluster,
  KubernetesVersion
} from '@linode/api-v4/lib/kubernetes';
import { LinodeType } from '@linode/api-v4/lib/linodes';
import { pluralize } from 'src/utilities/pluralize';
import { ExtendedCluster, ExtendedPoolNode, PoolNodeWithPrice } from './types';

export const nodeWarning = `We recommend at least 3 nodes in each pool. Fewer nodes may affect availability.`;

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

export const addPriceToNodePool = (
  pool: ExtendedPoolNode,
  typesData: LinodeType[]
) => ({
  ...pool,
  totalMonthlyPrice: getMonthlyPrice(pool.type, pool.count, typesData)
});

/**
 * Usually when displaying or editing clusters, we need access
 * to pricing information as well as statistics, which aren't
 * returned from the API and must be computed.
 */
export const extendCluster = (
  cluster: KubernetesCluster,
  pools: ExtendedPoolNode[],
  types: LinodeType[]
): ExtendedCluster => {
  // Identify which pools belong to this cluster and add pricing information.
  const _pools = pools.reduce((accum, thisPool) => {
    return thisPool.clusterID === cluster.id
      ? [...accum, addPriceToNodePool(thisPool, types)]
      : accum;
  }, []);
  const { CPU, RAM, Storage } = getTotalClusterMemoryCPUAndStorage(
    _pools,
    types
  );
  return {
    ...cluster,
    node_pools: _pools,
    totalMemory: RAM,
    totalCPU: CPU,
    totalStorage: Storage
  };
};

interface ClusterData {
  CPU: number;
  RAM: number;
  Storage: number;
}

export const getTotalClusterMemoryCPUAndStorage = (
  pools: ExtendedPoolNode[],
  types: LinodeType[]
) => {
  if (!types || !pools) {
    return { RAM: 0, CPU: 0, Storage: 0 };
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
        CPU: accumulator.CPU + thisType.vcpus * thisPool.count,
        Storage: accumulator.Storage + thisType.disk * thisPool.count
      };
    },
    { RAM: 0, CPU: 0, Storage: 0 }
  );
};

export const getTotalNodesInCluster = (pools: PoolNodeWithPrice[]): number =>
  pools.reduce((accum, thisPool) => {
    return accum + thisPool.count;
  }, 0);

export const getDescriptionForCluster = (cluster: ExtendedCluster) => {
  if (!cluster.node_pools) {
    return '';
  }
  const nodes = getTotalNodesInCluster(cluster.node_pools);
  return `${pluralize('node', 'nodes', nodes)}, ${pluralize(
    'CPU core',
    'CPU cores',
    cluster.totalCPU
  )}, ${cluster.totalMemory / 1024}GB RAM`;
};

export const getNextVersion = (
  currentVersion: string,
  versions: KubernetesVersion[]
) => {
  const versionStrings = versions.map(v => v.id).sort();
  const currentIdx = versionStrings.findIndex(
    thisVersion => currentVersion === thisVersion
  );
  if (currentIdx < 0 || currentIdx === versions.length - 1) {
    return null;
  }
  return versionStrings[currentIdx + 1];
};
