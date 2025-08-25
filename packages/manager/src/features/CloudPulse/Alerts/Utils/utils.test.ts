import { regionFactory } from '@linode/utilities';
import { act, renderHook } from '@testing-library/react';

import { alertFactory, serviceTypesFactory } from 'src/factories';

import { useContextualAlertsState } from '../../Utils/utils';
import { alertDefinitionFormSchema } from '../CreateAlert/schemas';
import {
  alertsFromEnabledServices,
  convertAlertDefinitionValues,
  convertAlertsToTypeSet,
  convertSecondsToMinutes,
  convertSecondsToOptions,
  filterAlerts,
  filterRegionByServiceType,
  getSchemaWithEntityIdValidation,
  getServiceTypeLabel,
  handleMultipleError,
  transformDimensionValue,
} from './utils';

import type { AlertValidationSchemaProps } from './utils';
import type {
  Alert,
  APIError,
  EditAlertPayloadWithService,
} from '@linode/api-v4';
import type {
  AclpAlertServiceTypeConfig,
  AclpServices,
} from 'src/featureFlags';

it('test getServiceTypeLabel method', () => {
  const services = serviceTypesFactory.buildList(3);
  services.forEach((service) => {
    // validate for proper labels
    expect(getServiceTypeLabel(service.service_type, { data: services })).toBe(
      service.label
    );
  });
});
it('test convertSecondsToMinutes method', () => {
  expect(convertSecondsToMinutes(0)).toBe('0 minutes');
  expect(convertSecondsToMinutes(60)).toBe('1 minute');
  expect(convertSecondsToMinutes(120)).toBe('2 minutes');
  expect(convertSecondsToMinutes(65)).toBe('1 minute and 5 seconds');
  expect(convertSecondsToMinutes(1)).toBe('1 second');
  expect(convertSecondsToMinutes(59)).toBe('59 seconds');
});

it('test convertSecondsToOptions method', () => {
  expect(convertSecondsToOptions(300)).toEqual('5 min');
  expect(convertSecondsToOptions(60)).toEqual('1 min');
  expect(convertSecondsToOptions(3600)).toEqual('1 hr');
  expect(convertSecondsToOptions(900)).toEqual('15 min');
});

it('test filterAlerts method', () => {
  alertFactory.resetSequenceNumber();
  const alerts = [
    ...alertFactory.buildList(12, { created_by: 'system' }),
    alertFactory.build({
      label: 'Alert-14',
      scope: 'region',
      regions: ['us-east'],
    }),
  ];
  expect(
    filterAlerts({ alerts, searchText: '', selectedType: 'system' })
  ).toHaveLength(12);
  expect(
    filterAlerts({ alerts, searchText: '', selectedType: 'user' })
  ).toHaveLength(0);
  expect(
    filterAlerts({ alerts, searchText: 'Alert-1', selectedType: 'system' })
  ).toHaveLength(4);
  expect(
    filterAlerts({
      alerts,
      searchText: '',
      selectedType: 'system',
      regionId: 'us-east',
    })
  ).toHaveLength(13);
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
    regions,
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
    regions,
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
      serviceTypeObj: 'firewall',
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

  it('test convert secondsToOptions method', () => {
    expect(convertSecondsToOptions(300)).toEqual('5 min');
    expect(convertSecondsToOptions(60)).toEqual('1 min');
    expect(convertSecondsToOptions(3600)).toEqual('1 hr');
    expect(convertSecondsToOptions(900)).toEqual('15 min');
  });
});

describe('useContextualAlertsState', () => {
  it('should return empty initial state when no entityId provided', () => {
    const alerts = alertFactory.buildList(3);
    const { result } = renderHook(() => useContextualAlertsState(alerts));
    expect(result.current.initialState).toEqual({ system: [], user: [] });
  });

  it('should include alerts that match entityId or account/region level alerts in initial states', () => {
    const entityId = '123';
    const alerts = [
      alertFactory.build({
        id: 1,
        label: 'alert1',
        type: 'system',
        entity_ids: [entityId],
        scope: 'entity',
      }),
      alertFactory.build({
        id: 2,
        label: 'alert2',
        type: 'user',
        entity_ids: [entityId],
        scope: 'entity',
      }),
      alertFactory.build({
        id: 3,
        label: 'alert3',
        type: 'system',
        entity_ids: ['456'],
        scope: 'region',
      }),
    ];

    const { result } = renderHook(() =>
      useContextualAlertsState(alerts, entityId)
    );

    expect(result.current.initialState.system).toContain(1);
    expect(result.current.initialState.system).toContain(3);
    expect(result.current.initialState.user).toContain(2);
  });

  it('should detect unsaved changes when alerts are modified', () => {
    const entityId = '123';
    const alerts = [
      alertFactory.build({
        label: 'alert1',
        type: 'system',
        entity_ids: [entityId],
        scope: 'entity',
      }),
    ];

    const { result } = renderHook(() =>
      useContextualAlertsState(alerts, entityId)
    );

    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => {
      result.current.setEnabledAlerts((prev) => ({
        ...prev,
        system: [...(prev.system ?? []), 999],
      }));
    });

    expect(result.current.hasUnsavedChanges).toBe(true);
  });
});

describe('filterRegionByServiceType', () => {
  const regions = [
    regionFactory.build({
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Managed Databases'],
      },
    }),
    ...regionFactory.buildList(3, {
      monitors: {
        metrics: [],
        alerts: [],
      },
    }),
    ...regionFactory.buildList(3, {
      monitors: {
        alerts: ['Linodes', 'Managed Databases'],
        metrics: [],
      },
    }),
    regionFactory.build({
      monitors: undefined,
    }),
  ];

  it('should return empty list for linode metrics', () => {
    const result = filterRegionByServiceType('metrics', regions, 'linode');

    expect(result).toHaveLength(0);
  });

  it('should return 4 regions for linode alerts', () => {
    expect(filterRegionByServiceType('alerts', regions, 'linode')).toHaveLength(
      4
    );
  });

  it('should return 1 region for dbaas metrics', () => {
    expect(filterRegionByServiceType('metrics', regions, 'dbaas')).toHaveLength(
      1
    );
  });

  it('should return 3 regions for dbaas alerts', () => {
    expect(filterRegionByServiceType('alerts', regions, 'dbaas')).toHaveLength(
      3
    );
  });

  it('should return no regions for nodebalancer service type', () => {
    const result = filterRegionByServiceType('alerts', regions, 'nodebalancer');

    expect(result).toHaveLength(0);
  });
});

describe('filterRegionByServiceType', () => {
  const regions = [
    regionFactory.build({
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Managed Databases'],
      },
    }),
    ...regionFactory.buildList(3, {
      monitors: {
        metrics: [],
        alerts: [],
      },
    }),
    ...regionFactory.buildList(3, {
      monitors: {
        alerts: ['Linodes', 'Managed Databases'],
        metrics: [],
      },
    }),
    regionFactory.build(),
  ];

  it('should return empty list for linode metrics', () => {
    const result = filterRegionByServiceType('metrics', regions, 'linode');

    expect(result).toHaveLength(0);
  });

  it('should return 4 regions for linode alerts', () => {
    expect(filterRegionByServiceType('alerts', regions, 'linode')).toHaveLength(
      4
    );
  });

  it('should return 1 region for dbaas metrics', () => {
    expect(filterRegionByServiceType('metrics', regions, 'dbaas')).toHaveLength(
      1
    );
  });

  it('should return 3 regions for dbaas alerts', () => {
    expect(filterRegionByServiceType('alerts', regions, 'dbaas')).toHaveLength(
      3
    );
  });

  it('should return no regions for firewall service type', () => {
    const result = filterRegionByServiceType('alerts', regions, 'firewall');

    expect(result).toHaveLength(0);
  });
});

describe('alertsFromEnabledServices', () => {
  const allAlerts = [
    ...alertFactory.buildList(3, { service_type: 'dbaas' }),
    ...alertFactory.buildList(3, { service_type: 'linode' }),
  ];
  const aclpServicesFlag: Partial<AclpServices> = {
    linode: {
      alerts: { enabled: true, beta: true },
      metrics: { enabled: true, beta: true },
    },
    dbaas: {
      alerts: { enabled: false, beta: true },
      metrics: { enabled: false, beta: true },
    },
  };

  it('should return empty list when no alerts are provided', () => {
    const result = alertsFromEnabledServices([], aclpServicesFlag);
    expect(result).toHaveLength(0);
  });

  it('should return alerts from enabled services', () => {
    const result = alertsFromEnabledServices(allAlerts, aclpServicesFlag);
    expect(result).toHaveLength(3);
  });

  it('should not return alerts from services that are missing in the flag', () => {
    const result = alertsFromEnabledServices(allAlerts, {
      linode: {
        alerts: { enabled: true, beta: true },
        metrics: { enabled: true, beta: true },
      },
    });
    expect(result).toHaveLength(3);
  });

  it('should not return alerts from services that are missing the alerts property in the flag', () => {
    const result = alertsFromEnabledServices(allAlerts, {
      linode: {
        metrics: { enabled: true, beta: true },
      },
    });
    expect(result).toHaveLength(0);
  });
});

describe('transformDimensionValue', () => {
  it('should apply service-specific transformations', () => {
    expect(transformDimensionValue('linode', 'type', '')).toBe('');
    expect(transformDimensionValue('linode', 'operation', 'read')).toBe('Read');
    expect(transformDimensionValue('dbaas', 'node_type', 'primary')).toBe(
      'Primary'
    );
    expect(
      transformDimensionValue('firewall', 'interface_type', 'public')
    ).toBe('PUBLIC');
    expect(transformDimensionValue('nodebalancer', 'protocol', 'http')).toBe(
      'HTTP'
    );
  });

  it('should fallback to capitalize for unknown dimensions', () => {
    expect(
      transformDimensionValue('linode', 'unknown_dimension', 'test_value')
    ).toBe('Test_value');
  });
});
