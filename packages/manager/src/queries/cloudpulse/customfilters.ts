import { getFilters } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import type { Filter, Params } from '@linode/api-v4';
import type { CloudPulseServiceTypeFiltersOptions } from 'src/features/CloudPulse/Utils/models';

export const useGetCustomFiltersQuery = (
  url: string,
  enabled: boolean,
  queryKey: string, // the query will cache the results, this control is here given to the caller
  idField: string,
  labelFields: string,
  params: Params = {},
  filter: Filter = {}
) => {
  return useQuery<
    { [key: string]: unknown }[], // the use case here is api url and api response here is not consistent across multiple service types, it can list of db engines, list of node types etc.,
    unknown,
    CloudPulseServiceTypeFiltersOptions[]
  >([queryKey], () => getAllFilters(params, filter, url), {
    // receive any array return id and label
    enabled,
    select: (filters) => {
      // whatever field we receive, just return id and label
      return filters.map(
        (filter: {
          [key: string]: unknown;
        }): CloudPulseServiceTypeFiltersOptions => {
          return {
            id: String(filter[idField]),
            label: String(filter[idField]),
          };
        }
      );
    },
  });
};

export const getAllFilters = (
  passedParams: Params = {},
  passedFilter: Filter = {},
  url: string
) =>
  getAll<{ [key: string]: unknown }>((params, filter) =>
    getFilters(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
      url
    )
  )().then((data) => data.data);
