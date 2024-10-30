import type { Filter, FilterConditionTypes } from '@linode/api-v4';

type OrderDirection = FilterConditionTypes['+order'];
type XFilterableField = string;

type FilterOperator = Exclude<
  keyof FilterConditionTypes,
  '+order' | '+order_by'
>;

type FieldFilter = {
  [K in FilterOperator]?: FilterConditionTypes[K];
};

interface XFilterDefaults {
  order: OrderDirection;
  orderBy: XFilterableField;
}

interface BuildXFilterParams<T extends XFilterableField> {
  additionalFilters?: Partial<Record<T, FieldFilter>>;
  defaults: XFilterDefaults;
  order?: OrderDirection;
  orderBy?: T;
}

export function buildXFilters<T extends XFilterableField>({
  additionalFilters,
  defaults,
  order,
  orderBy,
}: BuildXFilterParams<T>): Filter {
  return {
    '+order': order ?? defaults.order,
    '+order_by': orderBy ?? defaults.orderBy,
    ...additionalFilters,
  };
}
