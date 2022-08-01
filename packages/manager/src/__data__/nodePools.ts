import { PoolNodeWithPrice } from 'src/features/Kubernetes/types';
import { ExtendedNodePool } from 'src/store/kubernetes/nodePools.actions';

export const pool1: ExtendedNodePool = {
  id: 1,
  count: 1,
  type: 'g6-standard-1',
  nodes: [
    {
      status: 'ready',
      id: 'id-1',
      instance_id: 1,
    },
  ],
  clusterID: 10,
  autoscaler: {
    enabled: false,
    min: 1,
    max: 1,
  },
};

export const pool2: ExtendedNodePool = {
  id: 2,
  count: 5,
  type: 'g6-standard-2',
  nodes: [
    {
      status: 'ready',
      id: 'id-1',
      instance_id: 1,
    },
    {
      status: 'ready',
      id: 'id-2',
      instance_id: 2,
    },
  ],
  clusterID: 10,
  autoscaler: {
    enabled: false,
    min: 1,
    max: 1,
  },
};

export const pool3: ExtendedNodePool = {
  id: 3,
  count: 1,
  type: 'g6-standard-1',
  nodes: [
    {
      status: 'ready',
      id: 'id-1',
      instance_id: 1,
    },
  ],
  clusterID: 10,
  autoscaler: {
    enabled: false,
    min: 1,
    max: 1,
  },
};

export const extendedPools = [pool1, pool2, pool3];

export const node1 = {
  ...pool1,
  totalMonthlyPrice: 5,
  queuedForAddition: true,
};

export const node2 = {
  ...pool2,
  totalMonthlyPrice: 50,
  queuedForDeletion: true,
};

export const node3 = {
  ...pool3,
  totalMonthlyPrice: 50,
};

export const node4 = {
  ...pool3,
  totalMonthlyPrice: 1,
};

export const nodePoolRequests: PoolNodeWithPrice[] = [
  node1,
  node2,
  node3,
  node4,
];
