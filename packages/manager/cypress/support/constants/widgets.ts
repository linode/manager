/**
 * Defines the granularity levels used for specifying time intervals in data aggregation or reporting.
 * Each property represents a different granularity level.
 */
export const granularity = {
  auto: 'Auto',
  day1: '1 day',
  hour: '1 hr',
  minutes: '5 min',
};

/**
 * Defines various aggregation types that can be applied to data.
 * Each property represents a different type of aggregation operation.
 */
export const aggregation = {
  avg: 'avg',
  max: 'max',
  min: 'min',
  sum: 'sum',
};

// Define a constant object named `timeRange` to represent various time periods.
// This object maps time range identifiers to their descriptive strings.
export const timeRange = {
  last7Days: 'Last 7 Days',
  last12Hours: 'Last 12 Hours',
  last24Hours: 'Last 24 Hours',
  last30Days: 'Last 30 Days',
  last30Minutes: 'Last 30 Minutes',
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
  all: [aggregation.avg, aggregation.max, aggregation.min, aggregation.sum],
  basic: [aggregation.avg, aggregation.max, aggregation.min],
};
/**
 * Configuration object for widget details.
 * Each widget configuration includes expected aggregation types, granularity levels, and other relevant properties.
 */
export const widgetDetails = {
  dbaas: {
    cluster: 'mysql-cluster',
    dashboardName: 'Dbaas Dashboard',
    engine: 'MySQL',
    id: 1,
    metrics: [
      {
        StatsData: 'Controls for Disk I/O',
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_disk_OPS_total',
        title: 'Disk I/O',
      },
      {
        StatsData: 'Controls for CPU Utilization',
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.basic,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_cpu_utilization_percent',
        title: 'CPU Utilization',
      },
      {
        StatsData: 'Controls for Memory Usage',
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
      },
      {
        StatsData: 'Controls for Network Traffic',
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
      },
    ],
    nodeType: 'Primary',
    region: 'US, Chicago, IL (us-ord)',
    resource: 'Dbaas-resource',
    service_type: 'dbaas',
  },
  linode: {
    dashboardName: 'Linode Dashboard',
    id: 1,
    metrics: [
      {
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.basic,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_cpu_utilization_percent',
        title: 'CPU Utilization',
      },
      {
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
      },
      {
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
      },
      {
        expectedAggregation: aggregation.max,
        expectedAggregationArray: aggregationConfig.all,
        expectedGranularity: granularity.hour,
        expectedGranularityArray: Object.values(granularity),
        name: 'system_disk_OPS_total',
        title: 'Disk I/O',
      },
    ],
    region: 'US, Chicago, IL (us-ord)',
    resource: 'linode-resource',
    service_type: 'linode',
  },
};
