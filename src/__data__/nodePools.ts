import { ExtendedPoolNode } from 'src/features/Kubernetes/types';

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

export const nodePoolRequests: ExtendedPoolNode[] = [
  node1,
  node2,
  node3,
  node4
];
