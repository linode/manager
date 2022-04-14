import { Response } from 'support/util/response';
/**
 * Paginated data.
 */
export interface PaginatedData {
  data: any[];
  results: number;
  page: number;
  pages: number;
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
    results: arrayData.length,
    page: 1,
    pages: 1,
  };
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
): Response => {
  const dataArray = Array.isArray(data) ? data : [data];
  return {
    statusCode,
    body: {
      results: dataArray.length,
      data: dataArray,
      page,
      pages: totalPages,
    },
  };
};
