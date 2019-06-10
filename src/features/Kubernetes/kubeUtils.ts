import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { ExtendedPoolNode, PoolNode } from './types';

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
    return accumulator + node.totalMonthlyPrice * node.count;
  }, 0);

export const getClusterPrice = (pools: Linode.KubeNodePoolResponse[], types: ExtendedType[]) => {
  return getTotalClusterPrice(pools.map(pool => ({
    ...pool,
    totalMonthlyPrice: getMonthlyPrice(pool.type, pool.count, types)
  })));
}

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
