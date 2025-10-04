import { HttpResponse } from 'msw';

import { getPaginatedSlice } from '../utilities/pagination';

import type { APIError, ResourcePage } from '@linode/api-v4';
import type { JsonBodyType } from 'msw';

export interface APIPaginatedResponse<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

export interface APIErrorResponse {
  errors: APIError[];
}

// Type definitions for filters
interface ContainsFilter {
  '+contains': string;
}

interface OrCondition {
  [field: string]: ContainsFilter | number | string;
}

interface ApiFilter {
  '+or'?: OrCondition[];
  '+order'?: 'asc' | 'desc';
  '+order_by'?: string;
  [key: string]: ContainsFilter | number | OrCondition[] | string | undefined;
}

interface PaginatedResponse<T> {
  data: T[];
  request: Request;
}

/**
 * Builds a Mock Service Worker response.
 *
 * @param body - The body to return in the response.
 * @param status - The status code.
 * @param headers - The headers to return.
 *
 * @returns A response.
 */
export const makeResponse = <T extends JsonBodyType>(
  body: T,
  status: number = 200,
  headers: {} = {}
) => {
  return HttpResponse.json<T>(body, {
    headers,
    status,
  });
};

/**
 * Builds a Mock Service Worker error response.
 *
 * @param reason - The reason for the error.
 * @param status - The status code.
 * @param headers - The headers to return.
 *
 * @returns An error response.
 */
export const makeErrorResponse = (
  reason: string | string[] = 'An unexpected error occurred.',
  status: number = 400,
  headers: {} = {}
) => {
  const reasonsArray = Array.isArray(reason) ? reason : [reason];

  return HttpResponse.json<APIErrorResponse>(
    {
      errors: reasonsArray.map((reasonString) => ({
        reason: reasonString,
      })),
    },
    {
      headers,
      status,
    }
  );
};

/**
 * Builds a Mock Service Worker paginated response.
 * This will probably need to be expanded to support more complex sorting and filtering but this will solve the common use case.
 *
 * @param data - The data to return in the response.
 * @param request - The request that triggered the response.
 *
 * @returns A paginated response with X-Filter sort and filter logic.
 */
export const makePaginatedResponse = <T extends JsonBodyType>({
  data,
  request,
}: PaginatedResponse<T>) => {
  const dataArray = Array.isArray(data) ? data : [data];
  const url = new URL(request.url);
  const requestedPage = Number(url.searchParams.get('page')) || 1;
  const pageSize = Number(url.searchParams.get('page_size')) || 25;
  const xFilter = request.headers.get('X-Filter');
  const filter: ApiFilter = xFilter ? JSON.parse(xFilter) : {};
  const orderBy = filter['+order_by'] || 'id';
  const order = filter['+order'] || 'asc';

  // Handle simple property filters (equality)
  const propertyFilters = Object.entries(filter).filter(
    (entry): entry is [string, number | string] => {
      const [key, value] = entry;
      return (
        !key.startsWith('+') &&
        (typeof value === 'string' || typeof value === 'number')
      );
    }
  );

  // Handle complex filters like +or, +contains, etc.
  const complexFilters = Object.entries(filter).filter(
    (entry): entry is [string, OrCondition[]] => {
      const [key, value] = entry;
      return (
        key.startsWith('+') &&
        Array.isArray(value) &&
        key !== '+order_by' &&
        key !== '+order'
      );
    }
  );

  // Filter the data based on both types of filters
  const filteredData = dataArray.filter((item: T) => {
    // Handle simple property filters
    const passesSimpleFilters = propertyFilters.every(([key, value]) => {
      if (
        (key === 'region_applied' || key === 's3_endpoint') &&
        value === 'global'
      ) {
        return true;
      }

      return (
        typeof item === 'object' &&
        item !== null &&
        key in item &&
        item[key] === value
      );
    });

    // Handle complex filters
    const passesComplexFilters = complexFilters.every(
      ([filterType, filterValue]) => {
        if (filterType === '+or') {
          // Handle +or filters
          return filterValue.some((orCondition: OrCondition) => {
            return Object.entries(orCondition).some(([field, condition]) => {
              if (
                typeof condition === 'object' &&
                condition !== null &&
                '+contains' in condition
              ) {
                // Handle +contains
                const fieldValue =
                  item && typeof item === 'object'
                    ? (item[field] as string)
                    : item;
                const containsValue = (condition as ContainsFilter)[
                  '+contains'
                ];
                return (
                  typeof fieldValue === 'string' &&
                  fieldValue.toLowerCase().includes(containsValue.toLowerCase())
                );
              }
              // Handle simple equality in +or conditions
              return item && typeof item === 'object'
                ? item[field] === condition
                : item === condition;
            });
          });
        }

        // Add more complex filter types here as needed
        return true;
      }
    );

    return passesSimpleFilters && passesComplexFilters;
  });

  // Sort the data based on the order_by X-Filter
  filteredData.sort((a: T, b: T) => {
    if (
      !a ||
      !b ||
      !(orderBy in a) ||
      !(orderBy in b) ||
      typeof a !== 'object' ||
      typeof b !== 'object'
    ) {
      return 0;
    }

    const aValue = a[orderBy];
    const bValue = b[orderBy];

    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const results = filteredData.length;
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const pageSlice = getPaginatedSlice(filteredData, requestedPage, pageSize);

  return HttpResponse.json<ResourcePage<T>>({
    data: pageSlice,
    page: requestedPage,
    pages: pageCount,
    results,
  });
};

// ... rest of the code ...

/**
 * Builds a Mock Service Worker not found response.
 *
 * @returns A not found response.
 */
export const makeNotFoundResponse = () => {
  return makeErrorResponse('Not found', 404);
};
