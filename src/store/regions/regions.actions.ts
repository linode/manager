import { getRegions } from 'src/services/misc';
import { actionCreatorFactory } from 'typescript-fsa';
import { ThunkActionCreator } from '../types';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Linode.Region[],
  Linode.ApiFieldError[]
>(`request`);

export const requestRegions: ThunkActionCreator<
  Promise<Linode.Region[]>
> = () => dispatch => {
  dispatch(regionsRequestActions.started());

  return getRegions()
    .then(({ data }) => {
      // Mock in the Toronto region for testing
      dispatch(
        regionsRequestActions.done({
          result: [...data, { country: 'ca', id: 'ca-east' }]
        })
      );
      return data;
    })
    .catch(error => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
};
