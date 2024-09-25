/**
 * Defines the granularity levels used for specifying time intervals in data aggregation or reporting.
 * Each property represents a different granularity level.
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
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min'],
        expectedGranularity: '1 hr',
        name: 'system_cpu_utilization_percent',
        title: 'CPU Utilization',
        unit: '%',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
        unit: 'Bytes',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
        unit: 'Bytes',
      },
    ],
    nodeType: 'Secondary',
    region: 'US, Chicago, IL (us-ord)',
    resource: 'Dbaas-resource',
    service_type: 'dbaas',
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
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_memory_usage_by_resource',
        title: 'Memory Usage',
        unit: 'Bytes',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_network_io_by_resource',
        title: 'Network Traffic',
        unit: 'Bytes',
      },
      {
        expectedAggregation: 'max',
        expectedAggregationArray: ['avg', 'max', 'min', 'sum'],
        expectedGranularity: '1 hr',
        name: 'system_disk_OPS_total',
        title: 'Disk I/O',
        unit: 'OPS',
      },
    ],
    region: 'US, Chicago, IL (us-ord)',
    resource: 'linode-resource',
    service_type: 'linode',
  },
};
