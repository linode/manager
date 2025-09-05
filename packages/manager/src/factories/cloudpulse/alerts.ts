import { Factory } from '@linode/utilities';

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

export const memoryRulesFactory = Factory.Sync.makeFactory<MetricCriteria>({
  aggregate_function: 'avg',
  dimension_filters: [],
  metric: 'system_memory_usage_by_resource',
  operator: 'eq',
  threshold: 1000,
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
  scope: 'entity',
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
