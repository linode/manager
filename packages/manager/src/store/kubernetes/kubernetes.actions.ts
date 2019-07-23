import actionCreatorFactory from 'typescript-fsa';

import { EntityError } from 'src/store/types';

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

export const setErrors = actionCreator<EntityError>('set-errors');

export interface ClusterID {
  clusterID: number;
}

export type UpdateClusterParams = ClusterID & Partial<Linode.KubernetesCluster>;
export const updateClusterActions = actionCreator.async<
  UpdateClusterParams,
  Linode.KubernetesCluster,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteClusterParams = ClusterID;
export const deleteClusterActions = actionCreator.async<
  DeleteClusterParams,
  {},
  Linode.ApiFieldError[]
>(`delete-cluster`);
