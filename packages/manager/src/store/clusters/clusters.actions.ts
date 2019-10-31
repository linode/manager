import {
  getClusters,
  ObjectStorageCluster
} from 'linode-js-sdk/lib/object-storage';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

const actionCreator = actionCreatorFactory(`@@manager/clusters`);

export const clustersRequestActions = actionCreator.async<
  void,
  ObjectStorageCluster[],
  APIError[]
>(`request`);

export const requestClusters: ThunkActionCreator<
  Promise<ObjectStorageCluster[]>
> = () => dispatch => {
  dispatch(clustersRequestActions.started());

  return getClusters()
    .then(({ data }) => {
      dispatch(
        clustersRequestActions.done({
          result: data
        })
      );
      return data;
    })
    .catch(error => {
      dispatch(clustersRequestActions.failed({ error }));
      return error;
    });
};
