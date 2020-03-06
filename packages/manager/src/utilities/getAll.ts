import * as Bluebird from 'bluebird';
import { Domain, getDomains } from 'linode-js-sdk/lib/domains';
import { getLinodes, Linode } from 'linode-js-sdk/lib/linodes';
import {
  getNodeBalancers,
  NodeBalancer
} from 'linode-js-sdk/lib/nodebalancers';
import { getVolumes, Volume } from 'linode-js-sdk/lib/volumes';
import { range } from 'ramda';

import { API_MAX_PAGE_SIZE } from 'src/constants';
import { sendFetchAllEvent } from 'src/utilities/ga';

export interface APIResponsePage<T> {
  page: number;
  pages: number;
  data: T;
  results: number;
}

export type GetFunction = (
  params?: any,
  filters?: any
) => Promise<APIResponsePage<any>>;
export type GetFromEntity = (
  entityId?: number,
  params?: any,
  filters?: any
) => Promise<APIResponsePage<any>>;

export interface GetAllData<T> {
  data: T;
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
 * @example const getAllLinodes = getAll(getLinodes)
 * @example getAllLinodes(params, filter)
 *
 */
export const getAll: <T>(
  getter: GetFunction,
  pageSize?: number
) => (params?: any, filter?: any) => Promise<GetAllData<T[]>> = (
  getter,
  pageSize = API_MAX_PAGE_SIZE
) => (params?: any, filter?: any) => {
  const pagination = { ...params, page_size: pageSize };
  return getter(pagination, filter).then(
    ({ data: firstPageData, page, pages, results }) => {
      // If we only have one page, return it.
      if (page === pages) {
        return {
          data: firstPageData,
          results
        };
      }

      // Create an iterable list of the remaining pages.
      const remainingPages = range(page + 1, pages + 1);

      //
      return (
        Bluebird.map(remainingPages, nextPage =>
          getter({ ...pagination, page: nextPage }, filter).then(
            response => response.data
          )
        )
          /** We're given data[][], so we flatten that, and append the first page response. */
          .then(resultPages => {
            const combinedData = resultPages.reduce((result, nextPage) => {
              return [...result, ...nextPage];
            }, firstPageData);
            return {
              data: combinedData,
              results
            };
          })
      );
    }
  );
};

export const getAllWithArguments: <T>(
  getter: GetFunction,
  pageSize?: number
) => (args: any[], params?: any, filter?: any) => Promise<GetAllData<T[]>> = (
  getter,
  pageSize = API_MAX_PAGE_SIZE
) => (args = [], params, filter) => {
  const pagination = { ...params, page_size: pageSize };

  return getter(...args, pagination, filter).then(
    ({ data: firstPageData, page, pages, results }) => {
      // If we only have one page, return it.
      if (page === pages) {
        return {
          data: firstPageData,
          results
        };
      }

      // Create an iterable list of the remaining pages.
      const remainingPages = range(page + 1, pages + 1);

      //
      return (
        Bluebird.map(remainingPages, nextPage =>
          getter(...args, { ...pagination, page: nextPage }, filter).then(
            response => response.data
          )
        )
          /** We're given NodeBalancer[][], so we flatten that, and append the first page response. */
          .then(resultPages => {
            const combinedData = resultPages.reduce((result, nextPage) => {
              return [...result, ...nextPage];
            }, firstPageData);
            return {
              data: combinedData,
              results
            };
          })
      );
    }
  );
};

export const getAllFromEntity: (
  getter: GetFromEntity
) => (params?: any, filter?: any) => Promise<any> = getter => (
  entityId: number,
  params?: any,
  filter?: any
) => {
  const pagination = { ...params, page_size: 100 };
  return getter(entityId, pagination, filter).then(
    ({ data: firstPageData, page, pages }) => {
      // If we only have one page, return it.
      if (page === pages) {
        return firstPageData;
      }

      // Create an iterable list of the remaining pages.
      const remainingPages = range(page + 1, pages + 1);

      //
      return (
        Bluebird.map(remainingPages, nextPage =>
          getter({ ...pagination, page: nextPage }, filter).then(
            response => response.data
          )
        )
          /** We're given NodeBalancer[][], so we flatten that, and append the first page response. */
          .then(resultPages =>
            resultPages.reduce(
              (result, nextPage) => [...result, ...nextPage],
              firstPageData
            )
          )
      );
    }
  );
};

export type GetAllHandler = (
  linodes: Linode[],
  nodebalancers: NodeBalancer[],
  volumes: Volume[],
  domains: Domain[]
) => any;

/**
 * getAllEntities
 *
 * Uses getAll to request all instances of each type of entity and return
 * a 2d array of the combined results.
 *
 * @param cb Function that will be called after all requests have completed
 * with a 2d array of all the returned entities.
 */
export const getAllEntities = (cb: GetAllHandler) =>
  Bluebird.join(
    getAll<Linode>(getLinodes)(),
    getAll<NodeBalancer>(getNodeBalancers)(),
    getAll<Volume>(getVolumes)(),
    getAll<Domain>(getDomains)(),
    /** for some reason typescript thinks ...results is implicitly typed as 'any' */
    // @ts-ignore
    (...results) => {
      const resultData = [
        results[0].data,
        results[1].data,
        results[2].data,
        results[3].data
      ];

      /** total number of entities returned, as determined by the results API property */
      const numOfEntities =
        results[0].results +
        results[1].results +
        results[2].results +
        results[3].results;
      sendGetAllRequestToAnalytics(numOfEntities);
      /** for some reason typescript thinks ...results is implicitly typed as 'any' */
      // @ts-ignore
      cb(...resultData);
    }
  );

/**
 * sends off an analytics event with how many entities came back from a search request
 * for the purposes of determining how many entities does an average user have.
 *
 * @param { number } howManyThingsRequested - how many entities came back in our
 * network request to get all the things
 */
const sendGetAllRequestToAnalytics = (howManyThingsRequested: number) => {
  /**
   * We are splitting analytics tracking into a few different buckets
   */
  let bucketText = '';
  if (howManyThingsRequested > 500) {
    bucketText = '500+';
  } else if (howManyThingsRequested > 100) {
    bucketText = '100-499';
  } else if (howManyThingsRequested > 25) {
    bucketText = '26-100';
  } else if (howManyThingsRequested > 10) {
    bucketText = '11-26';
  } else {
    bucketText = '0-10';
  }

  /**
   * send an event with the number of requested entities
   * and the URL pathname and query string
   */
  sendFetchAllEvent(bucketText, howManyThingsRequested);
};
