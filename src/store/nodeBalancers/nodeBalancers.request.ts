import { range } from 'ramda';
import { createMeta } from 'src/store/request/request.helpers';
import { Action } from 'typescript-fsa';
import { actionCreator } from './nodeBalancers.actions';


type Entity = Linode.NodeBalancer;

/**
 * Get page
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getNodeBalancerPage = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);

const getNodeBalancerPageMeta = createMeta(getNodeBalancerPage, {
  endpoint: () => `/nodebalancers`,
  method: 'GET',
});

export const requestNodeBalancerPage = actionCreator<GetPageRequest>(`request/get-page`, getNodeBalancerPageMeta);


/**
 * Get all Linoes.
 */

export const getAllNodeBalancers = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const requestAllNodeBalancers = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch: (action: Action<any>) => Promise<Linode.ResourcePage<Entity>>) => {
  dispatch(getAllNodeBalancers.started());

  try {
    const requestAction = requestNodeBalancerPage({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const doneAction = getAllNodeBalancers.done({ result: mergedData });
      return dispatch(doneAction);
    }

    if (page < pages) {
      const r = range(page + 1, pages + 1);
      const requests = r.map((nextPage) => dispatch(requestNodeBalancerPage({ page: nextPage, page_size: 100 })));

      const results = await Promise.all(requests);

      const doneAction = getAllNodeBalancers.done({
        result: results.reduce((result, response) => [...result, ...response.data], data),
      });

      return dispatch(doneAction);
    }

    return;

  } catch (error) {
    return dispatch(getAllNodeBalancers.failed({ error }));
  }
};
