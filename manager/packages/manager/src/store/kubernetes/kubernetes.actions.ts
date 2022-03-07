import { KubernetesCluster } from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import actionCreatorFactory from 'typescript-fsa';

import { EntityError } from 'src/store/types';
import { GetAllData } from 'src/utilities/getAll';

export const actionCreator = actionCreatorFactory(`@@manager/kubernetes`);

export const requestClustersActions = actionCreator.async<
  void,
  GetAllData<KubernetesCluster>,
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
