import { range } from 'ramda';
import { getNodeBalancers as _getNodeBalancers } from 'src/services/nodebalancers';
import { createRequestThunk } from 'src/store/request/request.helpers';
import { RequestThunk } from 'src/store/types';
import { actionCreator } from './nodeBalancers.actions';

type Entity = Linode.NodeBalancer;

/**
 * Get page.
 */
export interface GetPageRequest {
  page?: number;
  page_size?: number;
  filter?: any;
}

export type GetPageResponse = Linode.ResourcePage<Entity>;

export const getNodeBalancerPageActions = actionCreator.async<GetPageRequest, GetPageResponse, Linode.ApiFieldError[]>(`get-page`);

export const getNodeBalancerPage = createRequestThunk(
  getNodeBalancerPageActions,
  ({ page, page_size, filter }) => _getNodeBalancers({ page, page_size }, filter)
);

/**
 * Get all.
 */
export const getAllNodeBalancersActions = actionCreator.async<void, Entity[], Linode.ApiFieldError[]>(`get-all`);

export const getAllNodeBalancers: RequestThunk<Entity[]> = (
  page: number = 1,
  prevData: Entity[] = [],
) => async (dispatch) => {
  dispatch(getAllNodeBalancersActions.started());

  try {
    const requestAction = getNodeBalancerPage({ page, page_size: 100 });
    const { data, pages } = await dispatch(requestAction);

    const mergedData = [...prevData, ...data];

    if (page === pages) {
      const finalPageAction = getAllNodeBalancersActions.done({ result: mergedData });
      dispatch(finalPageAction);
      return mergedData;
    }

    const r = range(page + 1, pages + 1);
    const requests = r.map((nextPage) => dispatch(getNodeBalancerPage({ page: nextPage, page_size: 100 })));

    const results = await Promise.all(requests);

    const doneAction = getAllNodeBalancersActions.done({
      result: results.reduce((result, response) => [...result, ...response.data], data),
    });

    dispatch(doneAction);

    return mergedData;

  } catch (error) {
    dispatch(getAllNodeBalancersActions.failed({ error }));
    throw error;
  }
};
