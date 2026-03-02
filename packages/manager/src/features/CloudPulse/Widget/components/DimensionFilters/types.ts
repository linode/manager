export interface MetricsDimensionFilterForm {
  /**
   * A list of filters applied on different metric dimensions.
   */
  dimension_filters: MetricsDimensionFilter[];
}

export interface MetricsDimensionFilter {
  /**
   * The label or name of the metric dimension to filter on.
   */
  dimension_label: null | string;

  /**
   * The comparison operator used for filtering.
   */
  operator: MetricsDimensionFilterOperatorType | null;

  /**
   * The value to compare against.
   */
  value: null | string;
}

export type MetricsDimensionFilterOperatorType =
  | 'endswith'
  | 'eq'
  | 'in'
  | 'neq'
  | 'startswith';
