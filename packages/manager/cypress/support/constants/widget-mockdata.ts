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

export const dashboardDefinitions = {
  data: [
    {
      created: '2024-09-06T08:09:43.641Z',
      id: 1,
      label: 'Linode Dashboard',
      service_type: 'linode',
      time_duration: {
        unit: 'min',
        value: 30,
      },
      updated: '2024-09-06T08:09:43.641Z',
      widgets: [],
    },
  ],
};

export const cloudPulseServices = {
  data: [{ service_type: 'linode' }],
};
