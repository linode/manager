import { Factory, regionFactory } from '@linode/utilities';

import type {
  Alert,
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  CreateAlertDefinitionPayload,
  Dimension,
  MetricCriteria,
  MetricDefinition,
  TriggerCondition,
} from '@linode/api-v4';

export const alertDimensionsFactory =
  Factory.Sync.makeFactory<AlertDefinitionDimensionFilter>({
    dimension_label: 'state',
    label: 'State of CPU',
    operator: 'eq',
    value: 'idle',
  });

export const alertRulesFactory =
  Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>({
    aggregate_function: 'avg',
    dimension_filters: alertDimensionsFactory.buildList(1),
    label: 'CPU Usage',
    metric: 'system_cpu_utilization_percent',
    operator: 'eq',
    threshold: 60,
    unit: 'Bytes',
  });

export const triggerConditionFactory =
  Factory.Sync.makeFactory<TriggerCondition>({
    criteria_condition: 'ALL',
    evaluation_period_seconds: 300,
    polling_interval_seconds: 300,
    trigger_occurrences: 5,
  });
export const cpuRulesFactory = Factory.Sync.makeFactory<MetricCriteria>({
  aggregate_function: 'avg',
  dimension_filters: [
    {
      dimension_label: 'state',
      operator: 'eq',
      value: 'user',
    },
  ],
  metric: 'system_cpu_utilization_percent',
  operator: 'eq',
  threshold: 1000,
});

export const ingressTrafficRateRulesFactory =
  Factory.Sync.makeFactory<MetricCriteria>({
    aggregate_function: 'avg',
    dimension_filters: [
      {
        dimension_label: 'port',
        operator: 'eq',
        value: '',
      },
      {
        dimension_label: 'protocol',
        operator: 'in',
        value: 'TCP,UDP',
      },
      {
        dimension_label: 'config_id',
        operator: 'eq',
        value: '',
      },
    ],
    metric: 'nb_ingress_traffic_rate',
    operator: 'eq',
    threshold: 1000, // adjust as per your alert threshold
  });

export const egressTrafficRateRulesFactory =
  ingressTrafficRateRulesFactory.extend({
    metric: 'nb_egress_traffic_rate',
  });

export const newSessionsRulesFactory = ingressTrafficRateRulesFactory.extend({
  metric: 'nb_new_sessions_per_second',
});

export const totalActiveSessionsRulesFactory =
  ingressTrafficRateRulesFactory.extend({
    metric: 'nb_total_active_sessions',
  });

export const totalActiveBackendsRulesFactory =
  ingressTrafficRateRulesFactory.extend({
    metric: 'nb_total_active_backends',
  });

export const memoryRulesFactory = Factory.Sync.makeFactory<MetricCriteria>({
  aggregate_function: 'avg',
  dimension_filters: [],
  metric: 'system_memory_usage_by_resource',
  operator: 'eq',
  threshold: 1000,
});
export const currentConnectionsRulesFactory =
  Factory.Sync.makeFactory<MetricCriteria>({
    aggregate_function: 'avg',
    dimension_filters: [
      { dimension_label: 'region_id', operator: 'eq', value: '' },
      { dimension_label: 'customer_id', operator: 'eq', value: '' },
      { dimension_label: 'parent_vm_entity_id', operator: 'eq', value: '' },
      { dimension_label: 'entity_id', operator: 'eq', value: '' },
      { dimension_label: 'interface_id', operator: 'eq', value: '' },
      {
        dimension_label: 'interface_type',
        operator: 'in',
        value: 'vpc,public',
      },
      { dimension_label: 'vpc_subnet_id', operator: 'eq', value: '' },
    ],
    metric: 'current_connections',
    operator: 'eq',
    threshold: 1000,
  });

export const availableConnectionsRulesFactory = {
  ...currentConnectionsRulesFactory,
  metric: 'available_connections',
};
export const ingressPacketsAcceptedRulesFactory = {
  ...currentConnectionsRulesFactory,
  metric: 'ingress_packets_accepted',
};

export const egressPacketsAcceptedRulesFactory = {
  ...currentConnectionsRulesFactory,
  metric: 'egress_packets_accepted',
};

export const ingressBytesAcceptedRulesFactory =
  Factory.Sync.makeFactory<MetricCriteria>({
    aggregate_function: 'avg',
    dimension_filters: [
      { dimension_label: 'region_id', operator: 'eq', value: '' },
      { dimension_label: 'customer_id', operator: 'eq', value: '' },
      { dimension_label: 'parent_vm_entity_id', operator: 'eq', value: '' },
      { dimension_label: 'entity_id', operator: 'eq', value: '' },
      { dimension_label: 'interface_id', operator: 'eq', value: '' },
      {
        dimension_label: 'interface_type',
        operator: 'in',
        value: 'vpc,public',
      },
      { dimension_label: 'vpc_subnet_id', operator: 'eq', value: '' },
    ],
    metric: 'ingress_bytes_accepted',
    operator: 'eq',
    threshold: 1000,
  });

export const egressBytesAcceptedRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'egress_bytes_accepted',
};

export const ingressPacketsDroppedRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'ingress_packets_dropped',
};

export const egressPacketsDroppedRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'egress_packets_dropped',
};

export const packetsDroppedConnectionTableFullRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'packets_dropped_connection_table_full',
};

export const newIngressConnectionsRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'new_ingress_connections',
};

export const newEgressConnectionsRulesFactory = {
  ...ingressBytesAcceptedRulesFactory,
  metric: 'new_egress_connections',
};
const endpoints = [
  'endpoint_type-E2-us-sea-2.linodeobjects.com',
  'endpoint_type-E3-us-sea-3.linodeobjects.com',
  'endpoint_type-E2-us-sea-4.linodeobjects.com',
];

export const baseObjectStorageRuleFactory =
  Factory.Sync.makeFactory<MetricCriteria>({
    aggregate_function: 'avg',
    dimension_filters: [
      {
        dimension_label: 'region',
        operator: 'eq',
        value: 'Chicago, IL',
      },
      {
        dimension_label: 'endpoint',
        operator: 'eq',
        value: 'endpoint_type-E2-us-sea-4.linodeobjects.com',
      },
      {
        dimension_label: 'endpoint',
        operator: 'in',
        value: endpoints.join(','), // ✅ join with commas
      },
    ],
    operator: 'eq',
    threshold: 1000,
    metric: '', // override later per rule
  });

export const metricBuilder = {
  metric: 'obj_bucket_size',
  ...baseObjectStorageRuleFactory,
};

export const bucketResponsesRule = baseObjectStorageRuleFactory.build({
  metric: 'obj_responses_num',
  dimension_filters: [
    {
      dimension_label: 'endpoint',
      operator: 'eq',
      value: 'endpoint_type-E3-us-sea-3iL',
    },
  ],
});

export const bytesDownloadedRule = baseObjectStorageRuleFactory.build({
  metric: 'obj_bytes_downloaded',
  dimension_filters: [
    {
      dimension_label: 'endpoint',
      operator: 'eq',
      value: 'endpoint_type-E3-us-sea-3iL',
    },
  ],
});

export const alertDefinitionFactory =
  Factory.Sync.makeFactory<CreateAlertDefinitionPayload>({
    channel_ids: [1, 2, 3],
    description: 'This is a default alert description.',
    entity_ids: ['1', '2', '3', '4', '5'],
    label: 'Default Alert Label',
    rule_criteria: {
      rules: [cpuRulesFactory.build(), memoryRulesFactory.build()],
    },
    severity: 1,
    tags: ['tag1', 'tag2'],
    trigger_conditions: triggerConditionFactory.build(),
  });

export const alertFactory = Factory.Sync.makeFactory<Alert>({
  alert_channels: [
    {
      id: 1,
      label: 'sample1',
      type: 'alert-channel',
      url: '',
    },
    {
      id: 2,
      label: 'sample2',
      type: 'alert-channel',
      url: '',
    },
  ],
  class: 'dedicated',
  created: new Date().toISOString(),
  created_by: 'system',
  description: 'Test description',
  entity_ids: ['1', '2', '3', '48', '50', '51'],
  scope: 'entity',
  regions: regionFactory.buildList(3).map(({ id }) => id),
  has_more_resources: true,
  id: Factory.each((i) => i),
  label: Factory.each((id) => `Alert-${id}`),
  rule_criteria: {
    rules: [alertRulesFactory.build({ dimension_filters: [] })],
  },
  service_type: 'linode',
  severity: 0,
  status: 'enabled',
  tags: ['tag1', 'tag2'],
  trigger_conditions: {
    criteria_condition: 'ALL',
    evaluation_period_seconds: 300,
    polling_interval_seconds: 600,
    trigger_occurrences: 3,
  },
  type: 'system',
  updated: new Date().toISOString(),
  updated_by: 'system',
});

const firewallDimensions: Dimension[] = [
  { label: 'VPC-Subnet', dimension_label: 'vpc_subnet_id', values: [] },
  {
    label: 'Interface Type',
    dimension_label: 'interface_type',
    values: ['vpc', 'public'],
  },
  { label: 'Interface', dimension_label: 'interface_id', values: [] },
  { label: 'Linode', dimension_label: 'linode_id', values: [] },
  { label: 'Linode Region', dimension_label: 'region_id', values: [] },
];

export const firewallMetricDefinitionFactory =
  Factory.Sync.makeFactory<MetricDefinition>({
    label: 'Firewall Metric',
    metric: 'firewall_metric',
    unit: 'metric_unit',
    metric_type: 'gauge',
    scrape_interval: '300s',
    is_alertable: true,
    available_aggregate_functions: ['avg', 'sum', 'max', 'min', 'count'],
    dimensions: firewallDimensions,
  });
export const firewallMetricDefinitionsResponse: MetricDefinition[] = [
  firewallMetricDefinitionFactory.build({
    label: 'Current connections',
    metric: 'fw_active_connections',
    unit: 'count',
    available_aggregate_functions: ['avg', 'max', 'min'],
  }),
  firewallMetricDefinitionFactory.build({
    label: 'Ingress packets accepted',
    metric: 'fw_ingress_packets_accepted',
    unit: 'packets_per_second',
    available_aggregate_functions: ['sum'],
  }),
];

export const firewallMetricRulesFactory =
  Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>({
    label: 'Current connections',
    metric: 'fw_active_connections',
    unit: 'count',
    aggregate_function: 'avg',
    operator: 'gt',
    threshold: 1000,
    dimension_filters: [
      {
        label: 'VPC-Subnet',
        dimension_label: 'vpc_subnet_id',
        operator: 'in',
        value: '1,2',
      },
      {
        label: 'Linode',
        dimension_label: 'linode_id',
        operator: 'in',
        value: '1,2',
      },
      {
        label: 'Linode Region',
        dimension_label: 'region_id',
        operator: 'in',
        value: 'pl-labkrk-2',
      },
    ],
  });

export const objectStorageMetricCriteria =
  Factory.Sync.makeFactory<AlertDefinitionMetricCriteria>({
    label: 'All requests',
    metric: 'obj_requests_num',
    unit: 'Count',
    aggregate_function: 'sum',
    operator: 'gt',
    threshold: 1000,
    dimension_filters: [
      {
        label: 'Endpoint',
        dimension_label: 'endpoint',
        operator: 'eq',
        value: 'us-iad-1.linodeobjects.com',
      },
      {
        label: 'Endpoint',
        dimension_label: 'endpoint',
        operator: 'in',
        value: 'ap-west-1.linodeobjects.com,us-iad-1.linodeobjects.com',
      },
    ],
  });

export const objectStorageMetricRules: MetricDefinition[] = [
  {
    label: 'All requests',
    metric_type: 'gauge',
    metric: 'obj_requests_num',
    unit: 'Count',
    scrape_interval: '60s',
    is_alertable: true,
    available_aggregate_functions: ['sum'],
    dimensions: [
      {
        label: 'Endpoint',
        dimension_label: 'endpoint',
        values: [],
      },
      {
        label: 'Request type',
        dimension_label: 'request_type',
        values: ['head', 'get', 'put', 'delete', 'list', 'other'],
      },
    ],
  },
];
