import { alertFactory, serviceTypesFactory } from 'src/factories';

import { alertDefinitionFormSchema } from '../CreateAlert/schemas';
import {
  convertAlertDefinitionValues,
  convertAlertsToTypeSet,
  convertSecondsToMinutes,
  filterAlertsByStatusAndType,
  getSchemaWithEntityIdValidation,
  getServiceTypeLabel,
  handleMultipleError,
} from './utils';

import type { AlertValidationSchemaProps } from './utils';
import type {
  Alert,
  APIError,
  EditAlertPayloadWithService,
} from '@linode/api-v4';
import type { AclpAlertServiceTypeConfig } from 'src/featureFlags';

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

it('test filterAlertsByStatusAndType method', () => {
  const alerts = alertFactory.buildList(12, { created_by: 'system' });
  expect(filterAlertsByStatusAndType(alerts, '', 'system')).toHaveLength(12);
  expect(filterAlertsByStatusAndType(alerts, '', 'user')).toHaveLength(0);
  expect(filterAlertsByStatusAndType(alerts, 'Alert-1', 'system')).toHaveLength(
    4
  );
});
it('test convertAlertsToTypeSet method', () => {
  const alerts = alertFactory.buildList(12, { created_by: 'user' });

  expect(convertAlertsToTypeSet(alerts)).toHaveLength(1);
});

it('should correctly convert an alert definition values to the required format', () => {
  const alert: Alert = alertFactory.build();
  const serviceType = 'linode';
  const {
    alert_channels,
    description,
    entity_ids,
    id,
    label,
    rule_criteria,
    severity,
    tags,
    trigger_conditions,
    type,
    group,
  } = alert;
  const expected: EditAlertPayloadWithService = {
    alertId: id,
    channel_ids: alert_channels.map((channel) => channel.id),
    description: description || undefined,
    entity_ids,
    label,
    rule_criteria: {
      rules: rule_criteria.rules.map((rule) => ({
        ...rule,
        dimension_filters:
          rule.dimension_filters?.map(({ label, ...filter }) => filter) ?? [],
      })),
    },
    serviceType,
    severity,
    tags,
    trigger_conditions,
    type,
    group,
  };

  expect(convertAlertDefinitionValues(alert, serviceType)).toEqual(expected);
});

describe('getSchemaWithEntityIdValidation', () => {
  const baseSchema = alertDefinitionFormSchema;
  const aclpAlertServiceTypeConfig: AclpAlertServiceTypeConfig[] = [
    { maxResourceSelectionCount: 3, serviceType: 'dbaas' },
    { maxResourceSelectionCount: 5, serviceType: 'linode' },
  ];
  const props: AlertValidationSchemaProps = {
    aclpAlertServiceTypeConfig,
    baseSchema,
    serviceTypeObj: 'dbaas',
  };

  it('should return baseSchema if maxSelectionCount is undefined', () => {
    const schema = getSchemaWithEntityIdValidation({
      ...props,
      serviceTypeObj: 'unknown',
    });
    expect(schema).toBe(baseSchema);
  });

  it("should return schema with maxSelectionCount for 'dbaas'", async () => {
    const schema = getSchemaWithEntityIdValidation({ ...props });

    await expect(
      schema.pick(['entity_ids']).validate({
        entity_ids: ['id1', 'id2', 'id3', 'id4'],
      })
    ).rejects.toThrow(
      "The overall number of entities assigned to an alert can't exceed 3."
    );
  });

  it("should return schema with correct maxSelectionCount for 'linode'", async () => {
    const schema = getSchemaWithEntityIdValidation({
      ...props,
      serviceTypeObj: 'linode',
    });
    await expect(
      schema.pick(['entity_ids']).validate({
        entity_ids: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6'],
      })
    ).rejects.toThrow(
      "The overall number of entities assigned to an alert can't exceed 5."
    );
  });
  it('should combine all the API errors to the parent field and return in errorMap properly', () => {
    const errors: APIError[] = [
      {
        field: 'label',
        reason: 'Label already exists',
      },
      {
        field: 'label',
        reason: 'Label should have less than 100 character',
      },
      {
        field: 'label',
        reason: 'Label should not start with special characters',
      },
      { field: 'severity', reason: 'Wrong field.' },
      {
        field: 'rule_criteria.rules[0].aggregate_function',
        reason: 'Must be one of avg, sum, min, max, count and no full stop',
      },
      {
        field: 'rule_criteria',
        reason: 'Must have at least one rule',
      },
      {
        field: 'rule_criteria.rules[0].dimension_filters[0].values',
        reason: 'Invalid value.',
      },
      {
        field: 'rule_criteria.rules[1].dimension_filters[3].values',
        reason: 'Invalid value.',
      },
    ];

    const CREATE_ALERT_ERROR_FIELD_MAP = {
      rule_criteria: 'rule_criteria.rules',
    };

    const MULTILINE_ERROR_SEPARATOR = '|';
    const SINGLELINE_ERROR_SEPARATOR = ' ';

    const setError = vi.fn();

    handleMultipleError({
      errorFieldMap: CREATE_ALERT_ERROR_FIELD_MAP,
      errors,
      multiLineErrorSeparator: MULTILINE_ERROR_SEPARATOR,
      setError,
      singleLineErrorSeparator: SINGLELINE_ERROR_SEPARATOR,
    });

    // Check that setError was called for each field correctly
    expect(setError).toHaveBeenCalledWith('label', {
      message:
        'Label already exists. Label should have less than 100 character. Label should not start with special characters.',
    });

    expect(setError).toHaveBeenCalledWith('severity', {
      message: 'Wrong field.',
    });

    expect(setError).toHaveBeenCalledWith('rule_criteria.rules', {
      message:
        'Must be one of avg, sum, min, max, count and no full stop.|Must have at least one rule.|Invalid value.',
    });
  });
});
