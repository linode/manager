import { range } from 'ramda';
import { createMeta } from 'src/store/request/request.helpers';
import { Action } from 'typescript-fsa';
import { actionCreator } from './volumes.actions';


type Entity = Linode.Volume;

/**
 * Get Volumes page
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getVolumePage = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);

const getVolumesPageMeta = createMeta(getVolumePage, {
  endpoint: () => `/volumes`,
  method: 'GET',
});

export const requestGetVolumePage = actionCreator<GetPageRequest>(`request/get-page`, getVolumesPageMeta);


/**
 * Get all Linoes.
 */

export const getAllVolumes = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllVolumes = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch: (action: Action<any>) => Promise<Linode.ResourcePage<Entity>>) => {
  dispatch(getAllVolumes.started());

  try {
    const requestAction = requestGetVolumePage({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllVolumes.done({ result: mergedData });
      return dispatch(doneAction);
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(requestGetVolumePage({ page: nextPage, page_size: 100 })));

      const results = await Promise.all(requests);

      const doneAction = getAllVolumes.done({
        result: results.reduce((result, response) => [...result, ...response.data], data),
      });

      return dispatch(doneAction);
    }

    return;

  } catch (error) {
    return dispatch(getAllVolumes.failed({ error }));
  }
};
