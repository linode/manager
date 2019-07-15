import { ExtendedPoolNode } from 'src/features/Kubernetes/types';

export const nodePoolRequests: ExtendedPoolNode[] = [
  {
    type: 'g5-standard-1',
    count: 1,
    totalMonthlyPrice: 5
  },
  {
    type: 'g5-standard-2',
    count: 5,
    totalMonthlyPrice: 50
  }
];
