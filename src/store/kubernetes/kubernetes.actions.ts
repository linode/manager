import actionCreatorFactory from 'typescript-fsa';

export const actionCreator = actionCreatorFactory(`@@manager/kubernetes`);

export const requestClustersActions = actionCreator.async<
  void,
  Linode.KubernetesCluster[],
  Linode.ApiFieldError[]
>('request');

export const addOrUpdateCluster = actionCreator<Linode.KubernetesCluster>(
  'add_or_update'
);

export const upsertCluster = actionCreator<Linode.KubernetesCluster>(`upsert`);

interface ClusterID {
  clusterID: string;
}

interface NodePoolID {
  nodePoolID: string;
}

export type UpdateClusterParams = ClusterID & Partial<Linode.KubernetesCluster>;
export const updateClusterActions = actionCreator.async<
  UpdateClusterParams,
  Linode.KubernetesCluster,
  Linode.ApiFieldError[]
>(`update`);

export type CreateNodePoolParams = ClusterID & Linode.PoolNodeRequest;
export const createNodePoolActions = actionCreator.async<
  CreateNodePoolParams,
  Linode.KubeNodePoolResponse[],
  Linode.ApiFieldError[]
>(`create-node-pool`);

export type UpdateNodePoolParams = ClusterID &
  NodePoolID &
  Linode.PoolNodeRequest;
export const updateNodePoolActions = actionCreator.async<
  UpdateNodePoolParams,
  Linode.KubeNodePoolResponse[],
  Linode.ApiFieldError[]
>(`update-node-pool`);
