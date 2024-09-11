/**
 * Defines the granularity levels used for specifying time intervals in data aggregation or reporting.
 * Each property represents a different granularity level.
 */
export const granularity = {
  Auto: 'Auto',
  Day1: '1 day',
  Hr1: '1 hr',
  Min5: '5 min',
};

/**
 * Defines various aggregation types that can be applied to data.
 * Each property represents a different type of aggregation operation.
 */
export const aggregation = {
  Avg: 'avg',
  Max: 'max',
  Min: 'min',
  Sum: 'sum',
};

// Define a constant object named `timeRange` to represent various time periods.
// This object maps time range identifiers to their descriptive strings.
export const timeRange = {
  Last7Days: 'Last 7 Days',
  Last12Hours: 'Last 12 Hours',
  Last24Hours: 'Last 24 Hours',
  Last30Days: 'Last 30 Days',
  Last30Minutes: 'Last 30 Minutes',
};

// Define a constant object named `timeUnit` which serves as a mapping
// between time unit identifiers and their full descriptive names.
// This object provides a convenient way to reference standard time units.
export const timeUnit = {
  day: 'Days',
  hr: 'Hours',
  min: 'Minutes',
};
/**
 * Configuration object defining predefined sets of aggregation types.
 * These sets can be used to specify acceptable aggregation operations for different contexts.
 */

export const aggregationConfig = {
  all: [aggregation.Avg, aggregation.Max, aggregation.Min, aggregation.Sum],
  basic: [aggregation.Avg, aggregation.Max, aggregation.Min],
};
/**
 * Configuration object for widget details.
 * Each widget configuration includes expected aggregation types, granularity levels, and other relevant properties.
 */
export const widgetDetails = {
  dbaas: [
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.basic,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_cpu_utilization_percent',
      title: 'CPU Utilization',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_memory_usage_by_resource',
      title: 'Memory Usage',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_network_io_by_resource',
      title: 'Network Traffic',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_disk_OPS_total',
      title: 'Disk I/O',
    },
  ],
  linode: [
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.basic,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_cpu_utilization_percent',
      title: 'CPU Utilization',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_memory_usage_by_resource',
      title: 'Memory Usage',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_network_io_by_resource',
      title: 'Network Traffic',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_disk_OPS_total',
      title: 'Disk I/O',
    },
  ],
};
