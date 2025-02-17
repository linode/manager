import { alertFactory, serviceTypesFactory } from 'src/factories';

import {
  convertAlertDefinitionDimensionFilterValues,
  convertAlertDefinitionMetricValues,
  convertAlertDefinitionValues,
  convertSecondsToMinutes,
  getServiceTypeLabel,
} from './utils';

import type {
  Alert,
  AlertDefinitionDimensionFilter,
  AlertDefinitionMetricCriteria,
  DimensionFilter,
  EditAlertPayloadWithService,
  MetricCriteria,
} from '@linode/api-v4';

it('test getServiceTypeLabel method', () => {
  const services = serviceTypesFactory.buildList(3);
  services.forEach((service) => {
    // validate for proper labels
    expect(getServiceTypeLabel(service.service_type, { data: services })).toBe(
      service.label
    );
  });
  expect(getServiceTypeLabel('test', { data: services })).toBe('test');
  expect(getServiceTypeLabel('', { data: services })).toBe('');
});
it('test convertSecondsToMinutes method', () => {
  expect(convertSecondsToMinutes(0)).toBe('0 minutes');
  expect(convertSecondsToMinutes(60)).toBe('1 minute');
  expect(convertSecondsToMinutes(120)).toBe('2 minutes');
  expect(convertSecondsToMinutes(65)).toBe('1 minute and 5 seconds');
  expect(convertSecondsToMinutes(1)).toBe('1 second');
  expect(convertSecondsToMinutes(59)).toBe('59 seconds');
});
it('should correctly convert an alert dimension filter value', () => {
  const formValues: AlertDefinitionDimensionFilter = {
    dimension_label: 'operating_system',
    label: 'Operating System',
    operator: 'eq',
    value: 'Linux',
  };

  const expected: DimensionFilter = {
    dimension_label: 'operating_system',
    operator: 'eq',
    value: 'Linux',
  };

  expect(convertAlertDefinitionDimensionFilterValues(formValues)).toEqual(
    expected
  );
});

it('should correctly convert an alert definition metric value', () => {
  const formValue: AlertDefinitionMetricCriteria = {
    aggregate_function: 'avg',
    dimension_filters: [
      {
        dimension_label: 'region',
        label: 'Region',
        operator: 'eq',
        value: 'us-ord',
      },
    ],
    label: 'CPU Usage',
    metric: 'cpu_usage',
    operator: 'gte',
    threshold: 1000,
    unit: 'Bytes',
  };

  const expected: MetricCriteria = {
    aggregate_function: 'avg',
    dimension_filters: [
      {
        dimension_label: 'region',
        operator: 'eq',
        value: 'us-ord',
      },
    ],
    metric: 'cpu_usage',
    operator: 'gte',
    threshold: 1000,
  };

  expect(convertAlertDefinitionMetricValues(formValue)).toEqual(expected);
});

it('should correctly convert an alert definition values to the required format', () => {
  const alert: Alert = alertFactory.build();
  const serviceType = 'linode';

  const expected: EditAlertPayloadWithService = {
    alertId: alert.id,
    channel_ids: alert.alert_channels.map((channel) => channel.id),
    description: alert.description || undefined,
    entity_ids: alert.entity_ids,
    label: alert.label,
    rule_criteria: {
      rules: alert.rule_criteria.rules.map((rule) =>
        convertAlertDefinitionMetricValues(rule)
      ),
    },
    serviceType,
    severity: alert.severity,
    tags: alert.tags,
    trigger_conditions: alert.trigger_conditions,
  };

  expect(convertAlertDefinitionValues(alert, serviceType)).toEqual(expected);
});
