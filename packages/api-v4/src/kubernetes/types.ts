import { PriceObject } from 'src/linodes';

export interface KubernetesCluster {
  created: string;
  updated: string;
  region: string;
  status: string; // @todo enum this
  label: string;
  k8s_version: string;
  id: number;
  tags: string[];
  type: KubernetesClusterTypes;
}

export interface KubeNodePoolResponse {
  count: number;
  id: number;
  nodes: PoolNodeResponse[];
  type: string;
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

export interface KubeConfigResponse {
  kubeconfig: string;
}

export interface KubernetesVersion {
  id: string;
}

export interface KubernetesEndpointResponse {
  endpoint: string;
}

export type KubernetesClusterTypes = 'lke-basic' | 'lke-standard';

export interface CreateKubeClusterPayload {
  label?: string; // Label will be assigned by the API if not provided
  region?: string; // Will be caught by Yup if undefined
  node_pools: PoolNodeRequest[];
  k8s_version?: string; // Will be caught by Yup if undefined
  type?: KubernetesClusterTypes;
}

export interface LKEPlan {
  id: string;
  label: string;
  price: PriceObject;
  availability: 'high' | 'standard';
}
