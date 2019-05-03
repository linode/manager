import { ExtendedType } from 'src/features/linodes/LinodesCreate/SelectPlanPanel';
import { PoolNode } from './types';

// @todo don't hard code this
export const KubernetesVersionOptions = ['1.13', '1.14'].map(version => ({
  label: version,
  value: version
}));

export const getMonthlyPrice = (pool: PoolNode, types?: ExtendedType[]) => {
  if (!types) {
    return 0;
  }
  const thisType = types.find(type => type.id === pool.type);
  return thisType ? thisType.price.monthly * pool.nodeCount : 0;
};

export const getTotalClusterPrice = (pools: PoolNode[]) =>
  pools.reduce((accumulator, node) => {
    return accumulator + node.totalMonthlyPrice;
  }, 0);
