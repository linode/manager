import { pathOr } from 'ramda';
import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import store from 'src/store';
import { PoolNode } from './types';

const getTypes = () =>
  pathOr(false, ['__resources', 'types', 'entities'], store.getState());

// @todo don't hard code this
export const KubernetesVersionOptions = ['1.13', '1.14'].map(version => ({
  label: version,
  value: version
}));

export const getMonthlyPrice = (pool: PoolNode) => {
  const types = getTypes();
  if (!types) {
    return 0;
  }
  const thisType = types.find((type: ExtendedType) => type.id === pool.type);
  return thisType ? thisType.price.monthly * pool.count : 0;
};

export const getTotalClusterPrice = (pools: PoolNode[]) =>
  pools.reduce((accumulator, node) => {
    return accumulator + node.totalMonthlyPrice;
  }, 0);

interface ClusterData {
  CPU: number;
  RAM: number;
}

export const getTotalClusterMemoryAndCPU = (pools: PoolNode[]) => {
  const types = getTypes();
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
        RAM: accumulator.RAM + thisType.memory,
        CPU: accumulator.CPU + thisType.vcpus
      };
    },
    { RAM: 0, CPU: 0 }
  );
};
