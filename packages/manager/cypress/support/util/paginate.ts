import type { ResourcePage } from '@linode/api-v4';
import type { StaticResponse } from 'support/cypress-exports';

/**
 * Paginated data.
 */
export interface PaginatedData {
  data: any[];
  page: number;
  pages: number;
  results: number;
}

/**
 * Paginates the given data.
 *
 * @param data - Object or array of objects for paginated data.
 *
 * @returns Paginated data.
 */
export const paginate = (data: any | any[]): PaginatedData => {
  const arrayData = Array.isArray(data) ? data : [data];
  return {
    data: arrayData,
    page: 1,
    pages: 1,
    results: arrayData.length,
  };
};

/**
 * Depaginates data from a function that returns paginated results.
 *
 * Accomplishes this by fetching the first page of results using the given
 * function, and fetching any remaining results if the first response does not
 * contain all of the data.
 *
 * @example
 * // Create a generator function, then use it to depaginate buckets.
 * const bucketsPage = (page: number) => getBuckets({ page });
 * const buckets: ObjectStorageBucket[] = await depaginate(bucketsPage);
 *
 * @param resultGenerator - A function which generates a paginated result.
 *
 * @returns Promise that resolves to an array of data.
 */
export const depaginate = async <T>(
  resultGenerator: (page: number) => Promise<ResourcePage<T>>
): Promise<T[]> => {
  const firstResult: ResourcePage<T> = await resultGenerator(1);
  const data = firstResult.data;
  if (firstResult.pages > 1) {
    const remainingResults: number = firstResult.pages - 1;
    const remainingResultsPromises = Array(remainingResults)
      .fill(null)
      .map(async (_element: null, index: number) => {
        const pageNumber = index + 2;
        const results = await resultGenerator(pageNumber);
        return results.data;
      });

    const responseResults = (
      await Promise.all(remainingResultsPromises)
    ).reduce((acc, cur) => {
      return [...acc, ...cur];
    }, []);

    return [...data, ...responseResults];
  }

  return data;
};

/**
 * Creates an HTTP response object whose body contains paginated data.
 *
 * @param data - Object or array of objects for paginated data.
 * @param statusCode - Response HTTP status. Default is `200`.
 * @param page - Current page for paginated response. Default is `1`.
 * @param totalPages - Total pages for paginated response. Default is `1`.
 *
 * @returns Paginated HTTP response object.
 */
export const paginateResponse = (
  data: any | any[],
  statusCode: number = 200,
  page: number = 1,
  totalPages: number = 1
): StaticResponse => {
  const dataArray = Array.isArray(data) ? data : [data];
  return {
    body: {
      data: dataArray,
      page,
      pages: totalPages,
      results: dataArray.length,
    },
    statusCode,
  };
};
