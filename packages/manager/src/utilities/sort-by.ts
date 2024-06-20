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

export const sortByVersion = (a: string, b: string, order: SortOrder) => {
  const aParts = a.split('.');
  const bParts = b.split('.');

  const result = (() => {
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i += 1) {
      // If one version has a part and another doesn't (e.g. 3.1 vs 3.1.1),
      // treat the missing part as 0.
      const aNumber = Number(aParts[i]) || 0;
      const bNumber = Number(bParts[i]) || 0;
      const diff = aNumber - bNumber;

      if (diff !== 0) {
        return diff;
      }
    }
    return 0;
  })();

  return order === 'asc' ? result : -result;
};
