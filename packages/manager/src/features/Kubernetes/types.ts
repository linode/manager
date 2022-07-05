import {
  KubernetesCluster,
  PoolNodeResponse,
  AutoscaleNodePool,
} from '@linode/api-v4';
import { APIError } from '@linode/api-v4';

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
  autoscaler: AutoscaleNodePool;
}
export interface ExtendedCluster extends KubernetesCluster {
  node_pools: PoolNodeWithPrice[];
  totalMemory: number;
  totalCPU: number;
  totalStorage: number;
}
