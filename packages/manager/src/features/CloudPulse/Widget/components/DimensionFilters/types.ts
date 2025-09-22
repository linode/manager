export interface MetricsDimensionFilterForm {
  dimension_filters: MetricsDimensionFilter[];
}

export interface MetricsDimensionFilter {
  dimension_label: null | string;
  operator: MetricsDimensionFilterOperatorType | null;
  value: null | string;
}

export type MetricsDimensionFilterOperatorType =
  | 'endswith'
  | 'eq'
  | 'in'
  | 'neq'
  | 'startswith';
