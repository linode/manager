import { getRegions, Region } from 'linode-js-sdk/lib/regions';
import { actionCreatorFactory } from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Region[],
  Linode.ApiFieldError[]
>(`request`);

export const requestRegions: ThunkActionCreator<
  Promise<Region[]>
> = () => dispatch => {
  dispatch(regionsRequestActions.started());

  return getRegions()
    .then(({ data }) => {
      dispatch(
        regionsRequestActions.done({
          result: data
        })
      );
      return data;
    })
    .catch(error => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
};
