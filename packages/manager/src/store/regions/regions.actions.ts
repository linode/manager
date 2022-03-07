import { getRegions, Region } from '@linode/api-v4/lib/regions';
import { APIError } from '@linode/api-v4/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

import { ThunkActionCreator } from 'src/store/types';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Region[],
  APIError[]
>(`request`);

type RequestRegionsThunk = ThunkActionCreator<Promise<Region[]>>;
export const requestRegions: RequestRegionsThunk = () => (dispatch) => {
  dispatch(regionsRequestActions.started());
  return getRegions()
    .then((regions) => {
      dispatch(regionsRequestActions.done({ result: regions.data }));
      return regions;
    })
    .catch((error) => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
};
