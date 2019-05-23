export interface PoolNode {
  type: string;
  count: number;
}

export interface ExtendedPoolNode extends PoolNode {
  totalMonthlyPrice: number;
}

export interface ExtendedCluster extends Linode.KubernetesCluster {
  totalMemory: number;
  totalCPU: number;
}
