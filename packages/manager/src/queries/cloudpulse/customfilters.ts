import { useQuery } from '@tanstack/react-query';

import type { Filter, Params } from '@linode/api-v4';
import type { CloudPulseServiceTypeFiltersOptions } from 'src/features/CloudPulse/Utils/models';
import type { QueryFunctionAndKey } from 'src/features/CloudPulse/Utils/models';
import type {
  QueryFunctionNonArrayType,
  QueryFunctionType,
} from 'src/features/CloudPulse/Utils/models';

/**
 * Interface that has the parameters required for making custom filter query call
 */
interface CustomFilterQueryProps {
  /**
   * The Built in API-V4 query factory functions like databaseQueries.types, databaseQueries.engines etc., makes use of existing query key and optimises cache
   */
  apiV4QueryKey?: QueryFunctionAndKey;
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
}

/**
 * This functions queries the API-V4 URL and returns the filter value list like db engines, node types, region and resources etc.,
 * @param queryProps - The parameters required for making custom filter query call
 */
export const useGetCustomFiltersQuery = (
  queryProps: CustomFilterQueryProps
) => {
  const { apiV4QueryKey, enabled, idField, labelField } = queryProps;
  return useQuery<
    QueryFunctionType,
    unknown,
    CloudPulseServiceTypeFiltersOptions[]
  >({
    // receive filters and  return only id and label
    enabled: enabled && apiV4QueryKey !== undefined,
    ...(apiV4QueryKey ?? { queryFn: () => [], queryKey: [''] }),
    select: (
      filters: QueryFunctionType
    ): CloudPulseServiceTypeFiltersOptions[] => {
      // whatever field we receive, just return id and label
      return filters
        .map((filter): CloudPulseServiceTypeFiltersOptions => {
          return {
            id: getStringValue(filter, idField) ?? '',
            label: getStringValue(filter, labelField) ?? '',
          };
        })
        .filter(({ id, label }) => id.length && label.length);
    },
  });
};

/**
 *
 * @param filter The queried filters like DatabaseEngine , DatabaseType
 * @param fieldKey The id and label field that needs to be fetched from the filter
 * @returns String value of the fieldKey in the filter object
 */
const getStringValue = (
  filter: QueryFunctionNonArrayType,
  fieldKey: string
): string | undefined => {
  if (fieldKey in filter) {
    const value = filter[fieldKey as keyof typeof filter]; // since we already checked fieldKey is present in filterObj like (DatabaseEngine, DatabaseType) we can fetch it by considering fieldKey as key of filter
    if (value) {
      return String(value);
    }
  }
  return undefined;
};
