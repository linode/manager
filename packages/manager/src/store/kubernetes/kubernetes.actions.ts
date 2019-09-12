import { KubernetesCluster } from 'linode-js-sdk/lib/kubernetes';
import actionCreatorFactory from 'typescript-fsa';

import { EntityError } from 'src/store/types';

export const actionCreator = actionCreatorFactory(`@@manager/kubernetes`);

export const requestClustersActions = actionCreator.async<
  void,
  KubernetesCluster[],
  Linode.ApiFieldError[]
>('request');

export const addOrUpdateCluster = actionCreator<KubernetesCluster>(
  'add_or_update'
);

export const upsertCluster = actionCreator<KubernetesCluster>(`upsert`);

export const setErrors = actionCreator<EntityError>('set-errors');

export interface ClusterID {
  clusterID: number;
}

export type UpdateClusterParams = ClusterID & Partial<KubernetesCluster>;
export const updateClusterActions = actionCreator.async<
  UpdateClusterParams,
  KubernetesCluster,
  Linode.ApiFieldError[]
>(`update`);

export type DeleteClusterParams = ClusterID;
export const deleteClusterActions = actionCreator.async<
  DeleteClusterParams,
  {},
  Linode.ApiFieldError[]
>(`delete-cluster`);
