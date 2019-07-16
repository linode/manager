export interface PoolNode {
  type: string;
  count: number;
}

export interface PoolNodeWithPrice extends PoolNode {
  id: number;
  totalMonthlyPrice: number;
  queuedForDeletion?: boolean;
  queuedForAddition?: boolean;
}

/** @todo DRY; this is duplicated from Kubernetes.ts. Unable to override node_pools,
 * so the duplication avoids an unwanted dependency (since the types/ directory belongs
 * to the API wrapper and shouldn't refer to any Manager-specific types).
 */
export interface ExtendedCluster {
  created: string;
  region: string;
  tags: string[];
  status: string; // @todo enum this
  label: string;
  version: string;
  id: number;
  node_pools: PoolNodeWithPrice[];
  totalMemory: number;
  totalCPU: number;
}
