/**
 * Intercepts request to metrics requests for a cloud pulse.
 *
 * @returns Cypress chainable.
 */

import { apiMatcher } from 'support/util/intercepts';
const dashboardMetricsData = {
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

const dashboardData = {
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
    {
      created: '2024-09-06T08:09:43.641Z',
      id: 2,
      label: 'DBaaS Dashboard',
      service_type: 'dbaas',
      time_duration: {
        unit: 'min',
        value: 30,
      },
      updated: '2024-09-06T08:09:43.641Z',
      widgets: [],
    },
  ],
};
const resourceData = {
  data: [
    {
      alerts: {
        cpu: 180,
        io: 10000,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
      },
      backups: {
        available: false,
        enabled: false,
        last_successful: null,
        schedule: {
          day: null,
          window: null,
        },
      },
      capabilities: [],
      created: '2024-04-24T12:11:28',
      disk_encryption: 'disabled',
      group: '',
      has_user_data: false,
      host_uuid: '2c9c27e421a9e088d8e49029a3596aa3a789ed74',
      hypervisor: 'kvm',
      id: 57667285,
      image: 'linode/debian11',
      ipv4: ['172.234.222.69'],
      ipv6: '2600:3c06::f03c:94ff:fe6a:684c/128',
      label: 'test1',
      lke_cluster_id: null,
      placement_group: null,
      region: 'us-ord',
      site_type: 'core',
      specs: {
        disk: 81920,
        gpus: 0,
        memory: 4096,
        transfer: 4000,
        vcpus: 2,
      },
      status: 'running',
      tags: [],
      type: 'g6-standard-2',
      updated: '2024-09-04T09:17:42',
      watchdog_enabled: true,
    },
    {
      alerts: {
        cpu: 180,
        io: 10000,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
      },
      backups: {
        available: false,
        enabled: false,
        last_successful: null,
        schedule: {
          day: null,
          window: null,
        },
      },
      capabilities: [],
      created: '2024-04-24T12:12:27',
      disk_encryption: 'disabled',
      group: '',
      has_user_data: false,
      host_uuid: '062252cf2ef2739a167ea31f3518086ca7f20a65',
      hypervisor: 'kvm',
      id: 57667325,
      image: 'linode/debian11',
      ipv4: ['172.234.222.72'],
      ipv6: '2600:3c06::f03c:94ff:fe6a:6894/128',
      label: 'linode2',
      lke_cluster_id: null,
      placement_group: null,
      region: 'us-ord',
      site_type: 'core',
      specs: {
        disk: 81920,
        gpus: 0,
        memory: 4096,
        transfer: 4000,
        vcpus: 2,
      },
      status: 'running',
      tags: [],
      type: 'g6-standard-2',
      updated: '2024-05-05T10:40:10',
      watchdog_enabled: true,
    },
    {
      alerts: {
        cpu: 180,
        io: 10000,
        network_in: 10,
        network_out: 10,
        transfer_quota: 80,
      },
      backups: {
        available: false,
        enabled: false,
        last_successful: null,
        schedule: {
          day: null,
          window: null,
        },
      },
      capabilities: [],
      created: '2024-04-24T12:13:21',
      disk_encryption: 'disabled',
      group: '',
      has_user_data: false,
      host_uuid: 'd939a55bfaed7afa7301c722948a5f99fd800c00',
      hypervisor: 'kvm',
      id: 57667355,
      image: 'linode/debian11',
      ipv4: ['172.234.222.73'],
      ipv6: '2600:3c06::f03c:94ff:fe6a:40db/128',
      label: 'Cloudpulse-demo-ananth',
      lke_cluster_id: null,
      placement_group: null,
      region: 'us-ord',
      site_type: 'core',
      specs: {
        disk: 81920,
        gpus: 0,
        memory: 4096,
        transfer: 4000,
        vcpus: 2,
      },
      status: 'running',
      tags: [],
      type: 'g6-standard-2',
      updated: '2024-04-30T04:37:18',
      watchdog_enabled: true,
    },
  ],
  page: 1,
  pages: 1,
  results: 3,
};

export const interceptGetMetricDefinitions = (): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('**/monitor/services/linode/metric-definitions'),
    dashboardMetricsData
  );
};
export const interceptGetDashBoards = (): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('**/monitor/services/linode/dashboards'),
    dashboardData
  );
};
export const interceptGetResources = (): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('**/linode/instances/?page_size=500'),
    resourceData
  );
};
export const interceptMetricsRequests = () => {
  cy.intercept({
    method: 'POST',
    url: '**/monitor/services/linode/metrics',
  }).as('getMetrics');
  return cy.wait(['@getMetrics', '@getMetrics', '@getMetrics', '@getMetrics']);
};
export const interceptMetricAPI = (
  mockResponse: any
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    '**/monitor/services/linode/metrics',
    mockResponse
  );
};
