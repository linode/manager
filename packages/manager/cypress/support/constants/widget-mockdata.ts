export const dashboardMetricsData = {
  data: [
    {
      available_aggregate_functions: ['min', 'max', 'avg'],
      dimensions: [
        {
          dim_label: 'cpu',
          label: 'CPU name',
          values: null,
        },
        {
          dim_label: 'state',
          label: 'State of CPU',
          values: [
            'user',
            'system',
            'idle',
            'interrupt',
            'nice',
            'softirq',
            'steal',
            'wait',
          ],
        },
        {
          dim_label: 'LINODE_ID',
          label: 'Linode ID',
          values: null,
        },
      ],
      label: 'CPU utilization',
      metric: 'system_cpu_utilization_percent',
      metric_type: 'gauge',
      scrape_interval: '2m',
      unit: 'percent',
    },
    {
      available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
      dimensions: [
        {
          dim_label: 'state',
          label: 'State of memory',
          values: [
            'used',
            'free',
            'buffered',
            'cached',
            'slab_reclaimable',
            'slab_unreclaimable',
          ],
        },
        {
          dim_label: 'LINODE_ID',
          label: 'Linode ID',
          values: null,
        },
      ],
      label: 'Memory Usage',
      metric: 'system_memory_usage_by_resource',
      metric_type: 'gauge',
      scrape_interval: '30s',
      unit: 'byte',
    },
    {
      available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
      dimensions: [
        {
          dim_label: 'device',
          label: 'Device name',
          values: ['lo', 'eth0'],
        },
        {
          dim_label: 'direction',
          label: 'Direction of network transfer',
          values: ['transmit', 'receive'],
        },
        {
          dim_label: 'LINODE_ID',
          label: 'Linode ID',
          values: null,
        },
      ],
      label: 'Network Traffic',
      metric: 'system_network_io_by_resource',
      metric_type: 'counter',
      scrape_interval: '30s',
      unit: 'byte',
    },
    {
      available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
      dimensions: [
        {
          dim_label: 'device',
          label: 'Device name',
          values: ['loop0', 'sda', 'sdb'],
        },
        {
          dim_label: 'direction',
          label: 'Operation direction',
          values: ['read', 'write'],
        },
        {
          dim_label: 'LINODE_ID',
          label: 'Linode ID',
          values: null,
        },
      ],
      label: 'Disk I/O',
      metric: 'system_disk_OPS_total',
      metric_type: 'counter',
      scrape_interval: '30s',
      unit: 'ops_per_second',
    },
  ],
};


export const cloudPulseServices = {
  data: [{ service_type: 'linode' }],
};

export const linodeMetricsDashboard = {
  created: '2024-04-29T17:09:29',
  id: '1',
  label: 'Linode Dashboard',
  service_type: 'linode',
  type: 'standard',
  updated: null,
  widgets: [
    {
      aggregate_function: 'avg',
      chart_type: 'area',
      color: 'blue',
      label: 'CPU utilization',
      metric: 'system_cpu_utilization_percent',
      size: 12,
      unit: '%',
      y_label: 'system_cpu_utilization_ratio',
    },
    {
      aggregate_function: 'avg',
      chart_type: 'area',
      color: 'red',
      label: 'Memory Usage',
      metric: 'system_memory_usage_by_resource',
      size: 12,
      unit: 'Bytes',
      y_label: 'system_memory_usage_bytes',
    },
    {
      aggregate_function: 'avg',
      chart_type: 'area',
      color: 'green',
      label: 'Network Traffic',
      metric: 'system_network_io_by_resource',
      size: 6,
      unit: 'Bytes',
      y_label: 'system_network_io_bytes_total',
    },
    {
      aggregate_function: 'avg',
      chart_type: 'area',
      color: 'yellow',
      label: 'Disk I/O',
      metric: 'system_disk_OPS_total',
      size: 6,
      unit: 'OPS',
      y_label: 'system_disk_operations_total',
    },
  ],
};
export const dashboardDefinitions = {
  data: [linodeMetricsDashboard],
};
