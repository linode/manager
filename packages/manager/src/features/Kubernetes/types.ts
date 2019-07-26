export interface PoolNodeWithPrice extends ExtendedPoolNode {
  totalMonthlyPrice: number;
  queuedForDeletion?: boolean;
  queuedForAddition?: boolean;
}

export interface ExtendedPoolNode {
  id: number;
  count: number;
  type: string;
  clusterID?: number;
  linodes?: Linode.PoolNodeResponse[];
}
export interface ExtendedCluster extends Linode.KubernetesCluster {
  node_pools: PoolNodeWithPrice[];
  totalMemory: number;
  totalCPU: number;
}
