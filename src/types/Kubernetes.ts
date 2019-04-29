namespace Linode {
  export interface KubernetesCluster {
    created: string;
    region: string;
    tags: string[];
    status: string; // @todo enum this
    label: string;
    version: string;
    id: string;
  }
}