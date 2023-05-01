import { parseAPIDate } from 'src/utilities/date';
type SortOrder = 'asc' | 'desc';

export const sortByString = (a: string, b: string, order: SortOrder) => {
  let result = 0;
  if (a.toLowerCase() < b.toLowerCase()) {
    result = -1;
  } else if (a.toLowerCase() > b.toLowerCase()) {
    result = 1;
  }
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};

export const sortByUTFDate = (a: string, b: string, order: SortOrder) => {
  const result = parseAPIDate(a).diff(parseAPIDate(b)).valueOf();
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};

export const sortByNumber = (a: number, b: number, order: SortOrder) => {
  let result = 0;
  if (a < b) {
    result = -1;
  } else if (a > b) {
    result = 1;
  }
  if (order === 'asc') {
    return result; // ascending order
  }
  return -result; // descending order
};

export const sortByArrayLength = (a: any[], b: any[], order: SortOrder) => {
  let result = 0;
  if (a.length > b.length) {
    result = 1;
  } else if (a.length < b.length) {
    result = -1;
  }

  return order === 'asc' ? result : -result;
};
