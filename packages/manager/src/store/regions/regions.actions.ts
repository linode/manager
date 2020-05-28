import { Capabilities, getRegions, Region } from '@linode/api-v4/lib/regions';
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
export const requestRegions: RequestRegionsThunk = () => dispatch => {
  dispatch(regionsRequestActions.started());
  return getRegions()
    .then(regions => {
      dispatch(
        regionsRequestActions.done({ result: regions.data.map(addGPUToRegion) })
      );
      return regions;
    })
    .catch(error => {
      dispatch(regionsRequestActions.failed({ error }));
      return error;
    });
};

/**
 * One day soon, the API will return GPU as one of a region's capabilities.
 * Until that, we're faking it here.
 */
const regionsWithGPUs = ['us-east'];
const addGPUToRegion = (region: Region) =>
  regionsWithGPUs.includes(region.id)
    ? {
        ...region,
        capabilities: [...region.capabilities, 'GPU Linodes'] as Capabilities[]
      }
    : region;
