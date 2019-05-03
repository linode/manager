export interface PoolNodeResponse {
  id: number;
  status: string;
}

export interface PoolNode {
  type?: string;
  nodeCount: number;
  totalMonthlyPrice: number;
}

// @todo should this live in services/ or types/?
export interface KubeNodePoolResponse {
  count: number;
  id: number;
  linodes: PoolNode[];
  lkeid: number;
  type: Linode.LinodeType;
}
