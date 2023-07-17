import { Filter, Params } from '@linode/api-v4';
import { range } from 'ramda';

import { API_MAX_PAGE_SIZE } from 'src/constants';

export interface APIResponsePage<T> {
  data: T;
  page: number;
  pages: number;
  results: number;
}

export type GetFunction<T> = (
  params?: Params,
  filters?: Filter
) => Promise<APIResponsePage<T[]>>;

export type GetFromEntity = (
  entityId?: number,
  params?: Params,
  filters?: Filter
) => Promise<APIResponsePage<any>>;

export interface GetAllData<T> {
  data: T[];
  results: number;
}

/**
 * getAll
 *
 * HOF that takes any paginated get function from the services library and returns a Promise
 * that resolves to an array of the passed object. The function makes an initial request
 * using the getter, then uses the response to determine the number of remaining pages.
 * Subsequent requests are then made and the results combined into a single array. This
 * procedure is necessary when retrieving all entities whenever the possible number of
 * entities is greater than the max number of results the API will return in a single page).
 *
 * @param getter { Function } one of the Get functions from the API services library. Accepts
 * pagination or filter parameters.
 *
 * @param pageSize Will default to the API_MAX_PAGE_SIZE.
 * @cb This is a weird one. Since getAll can in theory trigger a very long series of requests,
 * we need a hatch after the first request (at which point we know what's required).
 * The callback was originally added to allow us to mark an account as "large", since extremely large
 * accounts were bombing before the getAll method completed execution.
 *
 * @example const getAllLinodes = getAll(getLinodes)
 * @example getAllLinodes(params, filter)
 *
 */
export const getAll: <T>(
  getter: GetFunction<T>,
  pageSize?: number,
  cb?: (results: number) => void
) => (params?: Params, filter?: Filter) => Promise<GetAllData<T>> = (
  getter,
  pageSize = API_MAX_PAGE_SIZE,
  cb
) => (params?: Params, filter?: Filter) => {
  const pagination = { ...params, page_size: pageSize };
  return getter(pagination, filter).then(
    ({ data: firstPageData, page, pages, results }) => {
      // If we only have one page, return it.
      if (page === pages) {
        return {
          data: firstPageData,
          results,
        };
      }

      // If the number of results is over the threshold, use the callback
      // to mark the account as large
      if (cb) {
        cb(results);
      }

      // Create an iterable list of the remaining pages.
      const remainingPages = range(page + 1, pages + 1);

      const promises: Promise<any>[] = [];
      remainingPages.forEach((thisPage) => {
        const promise = getter({ ...pagination, page: thisPage }, filter).then(
          (response) => response.data
        );
        promises.push(promise);
      });
      //
      return (
        Promise.all(promises)
          /** We're given data[][], so we flatten that, and append the first page response. */
          .then((resultPages) => {
            const combinedData = resultPages.reduce((result, nextPage) => {
              return [...result, ...nextPage];
            }, firstPageData);
            return {
              data: combinedData,
              results,
            };
          })
      );
    }
  );
};
