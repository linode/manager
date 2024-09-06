import { aggregation, aggregationConfig } from 'support/constants/aggregation';
import { granularity } from 'support/constants/granularity';

export const widgetDetails = {
  dbaas: [
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_disk_OPS_total',
      title: 'Disk I/O',
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
      name: 'system_memory_usage_by_resource',
      title: 'Memory Usage',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.basic,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_cpu_utilization_percent',
      title: 'CPU Utilization',
    },
  ],
  linode: [
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.all,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_disk_OPS_total',
      title: 'Disk I/O',
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
      name: 'system_memory_usage_by_resource',
      title: 'Memory Usage',
    },
    {
      expectedAggregation: aggregation.Max,
      expectedAggregationArray: aggregationConfig.basic,
      expectedGranularity: granularity.Hr1,
      expectedGranularityArray: Object.values(granularity),
      name: 'system_cpu_utilization_percent',
      title: 'CPU Utilization',
    },
  ],
};
