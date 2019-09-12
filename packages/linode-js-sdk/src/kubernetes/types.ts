export interface KubernetesCluster {
  created: string;
  region: string;
  tags: string[];
  status: string; // @todo enum this
  label: string;
  version: string;
  id: number;
}

export interface KubeNodePoolResponse {
  count: number;
  id: number;
  linodes: PoolNodeResponse[];
  type: string;
}

export interface PoolNodeResponse {
  id: number;
  status: string;
}

export interface PoolNodeRequest {
  type: string;
  count: number;
}

export interface KubeConfigResponse {
  kubeconfig: string;
}

export interface KubernetesVersion {
  id: string;
}

export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region?: string; // Will be caught by Yup if undefined
  node_pools: PoolNodeRequest[];
  version?: string; // Will be caught by Yup if undefined
  tags: string[];
}
