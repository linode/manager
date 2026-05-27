import { parseAPIDate } from '@akamai/compute-ui-core/datetime';

type SortOrder = 'asc' | 'desc';

export const sortByUTFDate = (a: string, b: string, order: SortOrder) => {
  const result = parseAPIDate(a).diff(parseAPIDate(b)).valueOf();
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};
