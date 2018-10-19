import * as Bluebird from 'bluebird';
import { range } from 'ramda';

export interface APIResponsePage<T> {
  page: number,
  pages: number,
  data: T,
  results: number,
}

export type GetFunction = (params?: any, filters?: any) => Promise<APIResponsePage<any>>;

/**
 * getAll
 * 
 * HOF that takes any paginated get function from the services library and returns a Promise
 * that resolves to an array of the passed object. The function makes an initial request
 * using the getter, then uses the response to determine the number of remaining pages.
 * Subsequent requests are then made and the results combined into a single array. This
 * procedure is necessary when retrieving all entities whenever the possible number of
 * entities is greater than 100 (the max number of results the API will return in a single
 * page).
 * 
 * @param getter { Function } one of the Get functions from the API services library. Accepts
 * pagination or filter parameters.
 * 
 * @example const getAllLinodes = getAll(getLinodes)
 * @example getAllLinodes(params, filter)
 * 
 */
export const getAll: (getter: GetFunction) => (params?: any, filter?: any) => Promise<any> =
  (getter) =>
    (params?: any, filter?: any) => {
      const pagination = { ...params, page_size: 100 };
      return getter(pagination, filter)
        .then(({ data: firstPageData, page, pages }) => {

          // If we only have one page, return it.
          if (page === pages) { return firstPageData; }

          // Create an iterable list of the remaining pages.
          const remainingPages = range(page + 1, pages + 1);

          //
          return Bluebird
            .map(remainingPages, nextPage =>
              getter({ ...pagination, page: nextPage }, filter).then(response => response.data),
            )
            /** We're given Linode.NodeBalancer[][], so we flatten that, and append the first page response. */
            .then(resultPages => resultPages.reduce((result, nextPage) => [...result, ...nextPage], firstPageData));
        });
  }