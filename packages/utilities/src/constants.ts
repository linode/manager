// Maximum page size allowed by the API. Used in the `getAll()` helper function
// to request as many items at once as possible.
export const API_MAX_PAGE_SIZE = 500;

export const LINODE_STATUS_PAGE_URL =
  import.meta.env.REACT_APP_STATUS_PAGE_URL ||
  'https://status.linode.com/api/v2';
