import type { Filter, FilterConditionTypes } from '@linode/api-v4';

export type OrderDirection = FilterConditionTypes['+order'];
type XFilterableField = string;

type FilterOperator = Exclude<
  keyof FilterConditionTypes,
  '+order' | '+order_by'
>;

type FieldFilter = {
  [K in FilterOperator]?: FilterConditionTypes[K];
};

interface BuildXFilterParams<T extends XFilterableField> {
  additionalFilters?: Partial<Record<T, FieldFilter>>;
  order: OrderDirection;
  orderBy: T;
}

export function buildXFilters<T extends XFilterableField>({
  additionalFilters,
  order,
  orderBy,
}: BuildXFilterParams<T>): Filter {
  return {
    '+order': order,
    '+order_by': orderBy,
    ...additionalFilters,
  };
}
