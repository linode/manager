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

export type UpdateClusterParams = ClusterID & Partial<Linode.KubernetesCluster>;
export const updateClusterActions = actionCreator.async<
  UpdateClusterParams,
  Linode.KubernetesCluster,
  Linode.ApiFieldError[]
>(`update`);
