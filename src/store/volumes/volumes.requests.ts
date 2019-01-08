import { range } from 'ramda';
import { requestActionCreatorFactory } from 'src/store/request/request.helpers';
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

export const getVolumePage = requestActionCreatorFactory<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(
  `volume`,
  `get-page`,
  { endpoint: () => `/volumes`, method: 'GET' },
);


/**
 * Get all.
 */

export const getAllVolumes = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllVolumes = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch: (action: Action<any>) => Promise<Linode.ResourcePage<Entity>>) => {
  dispatch(getAllVolumes.started());

  try {
    const requestAction = getVolumePage.request({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllVolumes.done({ result: mergedData });
      return dispatch(doneAction);
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(getVolumePage.request({ page: nextPage, page_size: 100 })));

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
