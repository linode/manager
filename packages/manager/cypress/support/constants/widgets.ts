import type {
  DimensionFilterOperatorType,
  MetricOperatorType,
} from '@linode/api-v4';

export interface Item<L extends string, T> {
  label: L;
  value: T;
}

/**
 * Provides configuration details for dashboards, including service types (DBaaS, Linode),
 * related metrics (such as CPU utilization, memory usage, disk I/O), and their properties like
 * expected aggregations, granularity, units, and labels. This configuration is used for validating
 * and interacting with dashboard widgets.
 */
export const widgetDetails = {
  dbaas: {
    clusterName: 'mysql-cluster',
    dashboardName: 'Dbaas Dashboard',
    engine: 'MySQL',
    id: 1,
    metrics: [
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_disk_OPS_total',
        title: 'Disk I/O',
        unit: 'OPS',
        yLabel: 'system_disk_operations_total',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min'],
        expectedGranularity: '1 hr',
        name: 'system_cpu_utilization_percent',
        title: 'CPU Utilization',
        unit: '%',
        yLabel: 'system_cpu_utilization_ratio',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
        unit: 'B',
        yLabel: 'system_memory_usage_bytes',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
        unit: 'B',
        yLabel: 'system_network_io_bytes_total',
      },
    ],
    nodeType: 'Secondary',
    region: 'US, Chicago, IL (us-ord)',
    resource: 'Dbaas-resource',
    serviceType: 'dbaas',
  },
  linode: {
    dashboardName: 'Linode Dashboard',
    id: 1,
    metrics: [
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min'],
        expectedGranularity: '1 hr',
        name: 'system_cpu_utilization_percent',
        title: 'CPU Utilization',
        unit: '%',
        yLabel: 'system_cpu_utilization_ratio',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
        unit: 'B',
        yLabel: 'system_memory_usage_bytes',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
        unit: 'B',
        yLabel: 'system_network_io_bytes_total',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_disk_OPS_total',
        title: 'Disk I/O',
        unit: 'OPS',
        yLabel: 'system_disk_operations_total',
      },
    ],
    region: 'US, Chicago, IL (us-ord)',
    resource: 'linode-resource',
    serviceType: 'linode',
  },
};

export const dimensionOperatorTypeMap: Record<
  DimensionFilterOperatorType,
  string
> = {
  endswith: 'ends with',
  eq: 'equals',
  neq: 'not equals',
  startswith: 'starts with',
};

export const metricOperatorTypeMap: Record<MetricOperatorType, string> = {
  eq: '=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
};
