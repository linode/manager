namespace Linode {
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
}
