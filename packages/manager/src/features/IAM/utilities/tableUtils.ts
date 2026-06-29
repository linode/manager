import { parseAPIDate } from '@akamai/compute-ui-core/datetime';
import {
  sortByArrayLength,
  sortByNumber,
  sortByString,
  splitAt,
} from '@akamai/compute-ui-core/formatting';

export type Order = 'asc' | 'desc';

const getValueAtPath = (
  object: unknown,
  path: (number | string)[],
  defaultValue = ''
): unknown => {
  if (object === undefined) {
    return defaultValue;
  }

  let result: unknown = object;

  for (const key of path) {
    if (result === null || typeof result !== 'object') {
      return defaultValue;
    }

    const value = (result as Record<number | string, unknown>)[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }

    result = value;
  }

  return result;
};

const isValidAPIDate = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false;
  }
  try {
    parseAPIDate(value);
    return true;
  } catch {
    return false;
  }
};

export const sortByUTFDate = (a: string, b: string, order: Order) => {
  const result = parseAPIDate(a).diff(parseAPIDate(b)).valueOf();
  if (order === 'asc') {
    return result;
  }
  return -result;
};

export const sortData = <T>(orderBy: string, order: Order) => {
  return (data: T[]) =>
    [...data].sort((a, b) => {
      /* If the column we're sorting on is an array (e.g. 'tags', which is string[]),
       *  we want to sort by the length of the array. Otherwise, do a simple comparison.
       */

      /**
       * special case for sorting by ipv4
       * if the orderBy property contains an array index, include it in
       * the path below. See "label="ipv4[0]" in SortableTableHead.tsx
       */
      let orderByProp: (number | string)[] | undefined;
      if (orderBy.includes('[')) {
        orderByProp = splitAt(orderBy.indexOf('['), orderBy).map((eachValue) =>
          eachValue.includes('[')
            ? +eachValue.replace(/[[\]']+/g, '')
            : eachValue
        );
      }

      /**
       * this allows us to pass a value such as 'maintenance:when' to the handleOrderChange
       * callback and it will turn it into a path-friendly format
       *
       * so "maintenance:when" turns into ['maintenance', 'when']
       *
       * useful for when you want to sort by a nested property
       */
      if (orderBy.includes(':')) {
        orderByProp = orderBy.split(':');
      }

      const path = orderByProp ?? [orderBy];
      const aValue = getValueAtPath(a, path);
      const bValue = getValueAtPath(b, path);

      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        return sortByArrayLength(aValue, bValue, order);
      }

      if (isValidAPIDate(aValue) && isValidAPIDate(bValue)) {
        return sortByUTFDate(aValue, bValue, order);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortByString(aValue, bValue, order);
      }
      return sortByNumber(aValue as number, bValue as number, order);
    });
};
