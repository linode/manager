import { getRegions } from 'src/services/misc';
import { actionCreatorFactory, AnyAction } from 'typescript-fsa';
import { ThunkAction } from '../../../node_modules/redux-thunk';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<void, Linode.Region[], Linode.ApiFieldError[]>(`request`);

export const requestRegions = (): ThunkAction<Promise<Linode.Region[]>, ApplicationState, undefined, AnyAction> => (dispatch) => {
  dispatch(regionsRequestActions.started());

  return getRegions()
    .then(({ data }) => {
      dispatch(regionsRequestActions.done({ result: data }));
      return data;
    })
    .catch((error) => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
}
