import { getRegions, Region } from 'linode-js-sdk/lib/regions';
import { APIError } from 'linode-js-sdk/lib/types';
import { actionCreatorFactory } from 'typescript-fsa';

import cachedRegions from 'src/cachedData/regions.json';
import { ThunkActionCreator } from 'src/store/types';

const actionCreator = actionCreatorFactory(`@@manager/regions`);

export const regionsRequestActions = actionCreator.async<
  void,
  Region[],
  APIError[]
>(`request`);

type RequestRegionsThunk = ThunkActionCreator<Promise<Region[]>>;
export const requestRegions: RequestRegionsThunk = () => dispatch => {
  /**
   * This is a semi-static endpoint, so use cached data
   * if it's available.
   */
  if (cachedRegions.data) {
    return Promise.resolve(
      dispatch(
        regionsRequestActions.done({
          result: cachedRegions.data as Region[]
        })
      )
    );
  }
  dispatch(regionsRequestActions.started());
  return getRegions()
    .then(regions => {
      dispatch(regionsRequestActions.done({ result: regions.data }));
      return regions;
    })
    .catch(error => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
};
