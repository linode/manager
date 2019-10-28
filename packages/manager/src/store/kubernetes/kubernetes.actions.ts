import { KubernetesCluster } from 'linode-js-sdk/lib/kubernetes';
import { APIError } from 'linode-js-sdk/lib/types';
import actionCreatorFactory from 'typescript-fsa';

import { EntityError } from 'src/store/types';

export const actionCreator = actionCreatorFactory(`@@manager/kubernetes`);

export const requestClustersActions = actionCreator.async<
  void,
  KubernetesCluster[],
  APIError[]
>('request');

export const upsertCluster = actionCreator<KubernetesCluster>(`upsert`);

export const setErrors = actionCreator<EntityError>('set-errors');

export interface ClusterID {
  clusterID: number;
}

export type UpdateClusterParams = ClusterID & Partial<KubernetesCluster>;
export const updateClusterActions = actionCreator.async<
  UpdateClusterParams,
  KubernetesCluster,
  APIError[]
>(`update`);

export type DeleteClusterParams = ClusterID;
export const deleteClusterActions = actionCreator.async<
  DeleteClusterParams,
  {},
  APIError[]
>(`delete-cluster`);

export const requestClusterActions = actionCreator.async<
  ClusterID,
  KubernetesCluster,
  APIError[]
>('request-cluster');
