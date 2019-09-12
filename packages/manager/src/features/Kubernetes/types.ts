import {
  KubernetesCluster,
  PoolNodeResponse
} from 'linode-js-sdk/lib/kubernetes';

export interface PoolNodeWithPrice extends ExtendedPoolNode {
  totalMonthlyPrice: number;
  queuedForDeletion?: boolean;
  queuedForAddition?: boolean;
  _error?: Linode.ApiFieldError[];
}

export interface ExtendedPoolNode {
  id: number;
  count: number;
  type: string;
  clusterID?: number;
  linodes?: PoolNodeResponse[];
}
export interface ExtendedCluster extends KubernetesCluster {
  node_pools: PoolNodeWithPrice[];
  totalMemory: number;
  totalCPU: number;
}
