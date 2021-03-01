import {
  KubernetesCluster,
  PoolNodeResponse,
} from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';

export interface PoolNodeWithPrice extends ExtendedPoolNode {
  totalMonthlyPrice: number;
  queuedForDeletion?: boolean;
  queuedForAddition?: boolean;
  _error?: APIError[];
}

export interface ExtendedPoolNode {
  id: number;
  count: number;
  type: string;
  clusterID?: number;
  nodes?: PoolNodeResponse[];
}
export interface ExtendedCluster extends KubernetesCluster {
  node_pools: PoolNodeWithPrice[];
  totalMemory: number;
  totalCPU: number;
  totalStorage: number;
}
