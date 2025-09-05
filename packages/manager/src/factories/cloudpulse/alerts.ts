import { Factory, regionFactory } from '@linode/utilities';

import type {
  Alert,
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  CreateAlertDefinitionPayload,
  MetricCriteria,
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
    metric: 'nb_egress_traffic_rate',
    operator: 'eq',
    threshold: 1000, // adjust as per your alert threshold
  });
export const newSessionsRulesFactory = Factory.Sync.makeFactory<MetricCriteria>(
  {
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
    metric: 'nb_new_sessions_per_second',
    operator: 'eq',
    threshold: 1000, // adjust threshold based on your session rate expectations
  }
);
export const totalActiveSessionsRulesFactory =
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
    metric: 'nb_total_active_sessions',
    operator: 'eq',
    threshold: 1000, // adjust as needed
  });
export const totalActiveBackendsRulesFactory =
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
    metric: 'nb_total_active_backends',
    operator: 'eq',
    threshold: 1000, // adjust as needed
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

export const availableConnectionsRulesFactory =
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
    metric: 'available_connections',
    operator: 'eq',
    threshold: 1000,
  });

export const ingressPacketsAcceptedRulesFactory =
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
    metric: 'ingress_packets_accepted',
    operator: 'eq',
    threshold: 1000,
  });

export const egressPacketsAcceptedRulesFactory =
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
    metric: 'egress_packets_accepted',
    operator: 'eq',
    threshold: 1000,
  });

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

export const egressBytesAcceptedRulesFactory =
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
    metric: 'egress_bytes_accepted',
    operator: 'eq',
    threshold: 1000,
  });

export const ingressPacketsDroppedRulesFactory =
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
    metric: 'ingress_packets_dropped',
    operator: 'eq',
    threshold: 1000,
  });

export const egressPacketsDroppedRulesFactory =
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
    metric: 'egress_packets_dropped',
    operator: 'eq',
    threshold: 1000,
  });

export const packetsDroppedConnectionTableFullRulesFactory =
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
    metric: 'packets_dropped_connection_table_full',
    operator: 'eq',
    threshold: 1000,
  });

export const newIngressConnectionsRulesFactory =
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
    metric: 'new_ingress_connections',
    operator: 'eq',
    threshold: 1000,
  });

export const newEgressConnectionsRulesFactory =
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
    metric: 'new_egress_connections',
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