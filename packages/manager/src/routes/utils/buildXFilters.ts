import type { Filter, FilterConditionTypes } from '@linode/api-v4';

export type OrderDirection = FilterConditionTypes['+order'];

type FilterOperator = Exclude<
  keyof FilterConditionTypes,
  '+order' | '+order_by'
>;

type FieldFilter = {
  [K in FilterOperator]?: FilterConditionTypes[K];
};

type AdditionalFilters =
  | Partial<FilterConditionTypes>
  | Partial<Record<string, FieldFilter>>;

interface BuildXFilterParams {
  additionalFilters?: AdditionalFilters;
  pagination?: {
    order: OrderDirection;
    orderBy: string;
  };
}

/**
 * Builds the xFilters object used to query the API.
 * The goal of this util it to ensure consistency in the shape of the xFilters object,
 * In the case of route validation.
 *
 * This util should usually be instantiated at the route level, then:
 * - used for route validation via fetchQuery (cache lookup)
 * - exported and added to react-query's "Filter" for the landing page
 *
 * Since fetchQuery won't refetch for an existing key, having sharable xFilters means we're just really parsing the cache.
 *
 * It is usually meant for a landing page with a filterable table.
 */
export function buildXFilters({
  additionalFilters,
  pagination,
}: BuildXFilterParams): Filter {
  return {
    '+order': pagination?.order,
    '+order_by': pagination?.orderBy,
    ...additionalFilters,
  };
}
