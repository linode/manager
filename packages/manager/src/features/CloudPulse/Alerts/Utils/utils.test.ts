import { object } from 'yup';

import { alertFactory, serviceTypesFactory } from 'src/factories';

import {
  convertAlertDefinitionValues,
  convertAlertsToTypeSet,
  convertSecondsToMinutes,
  enhanceValidationSchemaWithEntityIdValidation,
  filterAlertsByStatusAndType,
  getServiceTypeLabel,
} from './utils';

import type { CreateAlertDefinitionForm } from '../CreateAlert/types';
import type { AlertValidationSchemaProps } from './utils';
import type { Alert, EditAlertPayloadWithService } from '@linode/api-v4';
import type { AclpAlertServiceTypeConfig } from 'src/featureFlags';
import type { ObjectSchema } from 'yup';

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
  };

  expect(convertAlertDefinitionValues(alert, serviceType)).toEqual(expected);
});

describe('getValidationSchema', () => {
  const baseSchema = object({}) as ObjectSchema<CreateAlertDefinitionForm>;
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
    const schema = enhanceValidationSchemaWithEntityIdValidation({
      ...props,
      serviceTypeObj: 'unknown',
    });
    expect(schema).toBe(baseSchema);
  });

  it("should return schema with maxSelectionCount for 'dbaas'", async () => {
    const schema = enhanceValidationSchemaWithEntityIdValidation({ ...props });

    await expect(
      schema.validate({ entity_ids: ['id1', 'id2', 'id3', 'id4'] })
    ).rejects.toThrow(
      "The overall number of resources assigned to an alert can't exceed 3."
    );
  });

  it("should return schema with correct maxSelectionCount for 'linode'", async () => {
    const schema = enhanceValidationSchemaWithEntityIdValidation({
      ...props,
      serviceTypeObj: 'linode',
    });

    await expect(
      schema.validate({
        entity_ids: ['id1', 'id2', 'id3', 'id4', 'id5', 'id6'],
      })
    ).rejects.toThrow(
      "The overall number of resources assigned to an alert can't exceed 5."
    );
  });
});
