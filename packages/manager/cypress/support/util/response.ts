/**
 * @file Utility functions to easily create HTTP response objects for Cypress tests.
 */

/**
 * Object describing an HTTP response.
 */
export interface Response {
  status: number;
  body: any;
}

/**
 * Creates an HTTP response object with the given body data.
 *
 * @param body - Response body data.
 * @param status - Response HTTP status. Default is `200`.
 *
 * @returns HTTP response object.
 */
export const makeResponse = (body: any, status: number = 200): Response => {
  return {
    status,
    body,
  };
};

/**
 * Creates an HTTP response object whose body contains paginated data.
 *
 * @param data - Object or array of objects for paginated data.
 * @param status - Response HTTP status. Default is `200`.
 * @param page - Current page for paginated response. Default is `1`.
 * @param totalPages - Total pages for paginated response. Default is `1`.
 *
 * @returns Paginated HTTP response object.
 */
export const makePaginatedResponse = (
  data: any | any[],
  status: number = 200,
  page: number = 1,
  totalPages: number = 1
): Response => {
  const dataArray = Array.isArray(data) ? data : [data];
  return {
    status,
    body: {
      results: dataArray.length,
      data: dataArray,
      page,
      pages: totalPages,
    },
  };
};
