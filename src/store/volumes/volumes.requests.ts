import { range } from 'ramda';

import {RequestThunk} from 'src/store/types';

import { getVolumes as _getVolumes } from 'src/services/volumes';
import { createRequestThunk } from 'src/store/request/request.helpers';
import { actionCreator } from './volumes.actions';

type Entity = Linode.Volume;

/**
 * Get page.
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getVolumePageActions = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);

export const getVolumePage = createRequestThunk(
  getVolumePageActions,
  ({ page, page_size, filter }) => _getVolumes({ page, page_size }, filter),
);


/**
 * Get all.
 */

export const getAllVolumesActions = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const getAllVolumes: RequestThunk<Linode.ResourcePage<Entity>> = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch) => {
  dispatch(getAllVolumesActions.started());

  try {
    const requestAction = getVolumePage({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllVolumesActions.done({ result: mergedData });
      dispatch(doneAction);
      return mergedData;
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(getVolumePage({ page: nextPage, page_size: 100 })));

      const results = await Promise.all(requests);

      const doneAction = getAllVolumesActions.done({
        result: results.reduce((result, response) => [...result, ...response.data], data),
      });

      dispatch(doneAction);
      return mergedData;
    }
  } catch (error) {
    dispatch(getAllVolumesActions.failed({ error }));
    return error;
  }
};
