import * as Bluebird from 'bluebird';
import { range } from 'ramda';

import { sendEvent } from 'src/utilities/analytics';

import { getDomains } from 'src/services/domains';
import { getImages } from 'src/services/images';
import { getLinodes } from 'src/services/linodes';
import { getNodeBalancers } from 'src/services/nodebalancers';
import { getVolumes } from 'src/services/volumes';

export interface APIResponsePage<T> {
  page: number,
  pages: number,
  data: T,
  results: number,
}

export type GetFunction = (params?: any, filters?: any) => Promise<APIResponsePage<any>>;
export type GetFromEntity = (entityId?: number, params?: any, filters?: any) => Promise<APIResponsePage<any>>;

interface GetAllData<T> {
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
export const getAll: <T>(getter: GetFunction) => (params?: any, filter?: any) => Promise<GetAllData<T[]>> =
  (getter) =>
    (params?: any, filter?: any) => {
      const pagination = { ...params, page_size: 100 };
      return getter(pagination, filter)
        .then(({ data: firstPageData, page, pages, results }) => {

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
          return Bluebird
            .map(remainingPages, nextPage =>
              getter({ ...pagination, page: nextPage }, filter).then(response => response.data),
            )
            /** We're given Linode.NodeBalancer[][], so we flatten that, and append the first page response. */
            .then(resultPages => {
              const combinedData = resultPages.reduce((result, nextPage) => {
              return [...result, ...nextPage]
            }, firstPageData); 
              return {
                data: combinedData,
                results
              }
          });
        });
    }

export const getAllFromEntity: (getter: GetFromEntity) => (params?: any, filter?: any) => Promise<any> =
  (getter) =>
    (entityId: number, params?: any, filter?: any) => {
      const pagination = { ...params, page_size: 100 };
      return getter(entityId, pagination, filter)
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
const getAllLinodes = getAll<Linode.Linode>(getLinodes);
const getAllNodeBalancers = getAll<Linode.NodeBalancer>(getNodeBalancers);
const getAllVolumes = getAll<Linode.Volume>(getVolumes);
const getAllDomains = getAll<Linode.Domain>(getDomains);
const getAllImages = getAll<Linode.Image>(getImages);

export type GetAllHandler = (
  linodes: Linode.Linode[],
  nodebalancers: Linode.NodeBalancer[],
  volumes: Linode.Volume[],
  domains: Linode.Domain[],
  images: Linode.Image[]
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
    getAllLinodes(),
    getAllNodeBalancers(),
    getAllVolumes(),
    getAllDomains(),
    getAllImages(),
    /** for some reason typescript thinks ...results is implicitly typed as 'any' */
    // @ts-ignore
    (...results) => {
      /**
       * Get the number of public images for the purpose of substracting them
       * from the count we send to analytics
       */
      /** for some reason typescript compiler thinks ...results is implicitly typed as 'any' */
      // @ts-ignore
      const numberOfPublicImages = results[4].data.reduce((acc, eachImage) => {
        if (eachImage.is_public) {
          return acc + 1;
        }
        return acc;
      }, 0);

      const resultData = [
        results[0].data,
        results[1].data,
        results[2].data,
        results[3].data,
        results[4].data,
      ]

      /** total number of entities returned, as determined by the results API property */
      const numOfEntities = results[0].results
      + results[1].results
      + results[2].results
      + results[3].results
      /** count of images without public images */
      + (results[4].results - numberOfPublicImages)

      sendGetAllRequestToAnalytics(numOfEntities);
      /** for some reason typescript thinks ...results is implicitly typed as 'any' */
      // @ts-ignore
      cb(...resultData)
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
    bucketText = '500+'
  } else if (howManyThingsRequested > 100) {
    bucketText = '100-499'
  } else if (howManyThingsRequested > 25) {
    bucketText = '26-100'
  } else if (howManyThingsRequested > 10) {
    bucketText = '11-26'
  } else {
    bucketText = '0-10'
  }

  /**
   * send an event with the number of requested entities
   * and the URL pathname and query string
   */
  sendEvent({
    category: 'Search',
    action: 'Data fetch all entities',
    label: bucketText,
    value: howManyThingsRequested
  });
}