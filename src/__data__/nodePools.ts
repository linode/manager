import { PoolNodeWithPrice } from 'src/features/Kubernetes/types';
import { ExtendedNodePool } from 'src/store/kubernetes/nodePools.actions';

export const node1 = {
  id: 1,
  type: 'g5-standard-1',
  count: 1,
  totalMonthlyPrice: 5,
  queuedForAddition: true
};

export const node2 = {
  id: 2,
  type: 'g5-standard-2',
  count: 5,
  totalMonthlyPrice: 50,
  queuedForDeletion: true
};

export const node3 = {
  id: 3,
  type: 'g5-standard-2',
  count: 6,
  totalMonthlyPrice: 50
};

export const node4 = {
  id: 4,
  type: 'g6-standard-2',
  count: 1,
  totalMonthlyPrice: 1
};

export const nodePoolRequests: PoolNodeWithPrice[] = [
  node1,
  node2,
  node3,
  node4
];

export const pool1: ExtendedNodePool = {
  id: 1,
  count: 1,
  type: 'g6-standard-1',
  linodes: [
    {
      status: 'ready',
      id: 1
    }
  ],
  clusterID: 10
};

export const pool2: ExtendedNodePool = {
  id: 2,
  count: 2,
  type: 'g6-standard-1',
  linodes: [
    {
      status: 'ready',
      id: 1
    },
    {
      status: 'ready',
      id: 2
    }
  ],
  clusterID: 10
};

export const pool3: ExtendedNodePool = {
  id: 3,
  count: 1,
  type: 'g6-standard-1',
  linodes: [
    {
      status: 'ready',
      id: 1
    }
  ],
  clusterID: 10
};

export const extendedPools = [pool1, pool2, pool3];
