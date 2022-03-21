export interface KubernetesCluster {
  created: string;
  updated: string;
  region: string;
  status: string; // @todo enum this
  label: string;
  k8s_version: string;
  id: number;
  tags: string[];
  control_plane: ControlPlaneOptions;
}

export interface KubeNodePoolResponse {
  count: number;
  id: number;
  nodes: PoolNodeResponse[];
  type: string;
  autoscaler: AutoscaleNodePool;
}

export interface PoolNodeResponse {
  id: string;
  instance_id: number | null;
  status: string;
}

export interface PoolNodeRequest {
  type: string;
  count: number;
}

export interface AutoscaleNodePool {
  enabled: boolean;
  min: number;
  max: number;
}

export interface AutoscaleNodePoolRequest {
  clusterID: number;
  nodePoolID: number;
  autoscaler: AutoscaleNodePool;
}

export interface KubeConfigResponse {
  kubeconfig: string;
}

export interface KubernetesVersion {
  id: string;
}

export interface KubernetesEndpointResponse {
  endpoint: string;
}

export interface KubernetesDashboardResponse {
  url: string;
}

export interface ControlPlaneOptions {
  high_availability: boolean;
}

export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region?: string; // Will be caught by Yup if undefined
  node_pools: PoolNodeRequest[];
  k8s_version?: string; // Will be caught by Yup if undefined
  control_plane?: ControlPlaneOptions;
}
