import { APIError } from 'linode-js-sdk/lib/types';
import { getClusters } from 'src/services/objectStorage/clusters';
import { actionCreatorFactory } from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

const actionCreator = actionCreatorFactory(`@@manager/clusters`);

export const clustersRequestActions = actionCreator.async<
  void,
  Linode.Cluster[],
  APIError[]
>(`request`);

export const requestClusters: ThunkActionCreator<
  Promise<Linode.Cluster[]>
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
