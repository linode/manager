import { getFilters } from '@linode/api-v4';
import { useQuery } from '@tanstack/react-query';

import { getAll } from 'src/utilities/getAll';

import type { Filter, Params } from '@linode/api-v4';
import type { CloudPulseServiceTypeFiltersOptions } from 'src/features/CloudPulse/Utils/models';

/**
 * Interface that has the parameters required for making custom filter query call
 */
interface CustomFilterQueryProps {
  /**
   * This indicates whether or not to enable the query
   */
  enabled: boolean;
  /**
   * The xFilter that is used to filter the results in API
   */
  filter?: Filter;
  /**
   * The id field to consider from the response of the custom filter call
   */
  idField: string;
  /**
   * The label field to consider from the response of the custom filter call
   */
  labelField: string;
  /**
   * The params like pagination information to be passed to the API
   */
  params?: Params;

  /**
   * The API-V4 url, which needs to be called
   */
  url: string;
}

/**
 * This functions queries the API-V4 URL and returns the filter value list like db engines, node types, region and resources etc.,
 * @param queryProps - The parameters required for making custom filter query call
 */
export const useGetCustomFiltersQuery = (
  queryProps: CustomFilterQueryProps
) => {
  const { enabled, filter, idField, labelField, params, url } = queryProps;

  return useQuery<
    { [key: string]: unknown }[], // the use case here is api url and api response here is not consistent across multiple service types, it can list of db engines, list of node types etc.,
    unknown,
    CloudPulseServiceTypeFiltersOptions[]
  >({
    // receive filters and  return only id and label
    enabled,
    queryFn: () => getAllFilters(params, filter, url),
    queryKey: [url, filter],
    select: (filters) => {
      // whatever field we receive, just return id and label
      return filters.map(
        (filter: {
          [key: string]: unknown;
        }): CloudPulseServiceTypeFiltersOptions => {
          return {
            id: String(filter[idField]),
            label: String(filter[labelField]),
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
