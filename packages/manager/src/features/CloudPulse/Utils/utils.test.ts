import { regionFactory } from '@linode/utilities';
import { describe, expect, it } from 'vitest';

import {
  INTERFACE_ID,
  INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  INTERFACE_IDS_ERROR_MESSAGE,
  INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE,
  INTERFACE_IDS_LIMIT_ERROR_MESSAGE,
  PORT,
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LEADING_ZERO_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from './constants';
import {
  arePortsValid,
  areValidInterfaceIds,
  isValidPort,
  useIsAclpSupportedRegion,
  validationFunction,
} from './utils';

describe('isValidPort', () => {
  it('should return valid for empty string and valid ports', () => {
    expect(isValidPort('')).toBe(undefined);
    expect(isValidPort('1')).toBe(undefined);
    expect(isValidPort('80')).toBe(undefined);
    expect(isValidPort('65535')).toBe(undefined);
  });

  it('should return invalid for ports outside range 1-65535', () => {
    expect(isValidPort('0')).toBe(PORTS_RANGE_ERROR_MESSAGE);
    expect(isValidPort('01')).toBe(PORTS_LEADING_ZERO_ERROR_MESSAGE);
    expect(isValidPort('99999')).toBe(PORTS_RANGE_ERROR_MESSAGE);
  });
});

describe('arePortsValid', () => {
  it('should return valid for valid port combinations', () => {
    expect(arePortsValid('')).toBe(undefined);
    expect(arePortsValid('80')).toBe(undefined);
    expect(arePortsValid('80,443,8080')).toBe(undefined);
    expect(arePortsValid('1,65535')).toBe(undefined);
  });

  it('should return invalid for consecutive commas', () => {
    const result = arePortsValid('80,,443');
    expect(result).toBe(PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE);
  });

  it('should return invalid for ports starting with comma', () => {
    expect(arePortsValid(',80')).toBe(PORTS_LEADING_COMMA_ERROR_MESSAGE);
  });

  it('should return invalid for input value other than numbers and commas', () => {
    expect(arePortsValid('abc')).toBe(PORTS_ERROR_MESSAGE);
  });

  it('should return invalid for more than 15 ports', () => {
    const ports = Array.from({ length: 16 }, (_, i) => i + 1).join(',');
    const result = arePortsValid(ports);
    expect(result).toBe(PORTS_LIMIT_ERROR_MESSAGE);
  });
});

describe('areValidInterfaceIds', () => {
  it('should return valid for valid interface id combinations', () => {
    expect(areValidInterfaceIds('')).toBe(undefined);
    expect(areValidInterfaceIds('1')).toBe(undefined);
    expect(areValidInterfaceIds('1,2,3')).toBe(undefined);
  });

  it('should return invalid for consecutive commas', () => {
    const result = areValidInterfaceIds('1,,2');
    expect(result).toBe(INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE);
  });

  it('should return invalid for interface ids starting with comma', () => {
    expect(areValidInterfaceIds(',1')).toBe(
      INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE
    );
  });

  it('should return invalid for input value other than numbers and commas', () => {
    expect(areValidInterfaceIds('abc')).toBe(INTERFACE_IDS_ERROR_MESSAGE);
  });

  it('should return invalid for more than 15 interface ids', () => {
    const interfaceIds = Array.from({ length: 16 }, (_, i) => i + 1).join(',');
    const result = areValidInterfaceIds(interfaceIds);
    expect(result).toBe(INTERFACE_IDS_LIMIT_ERROR_MESSAGE);
  });
});

describe('validationFunction', () => {
  it('should return validation function for given filterKey', () => {
    expect(validationFunction[PORT]).toBe(arePortsValid);
    expect(validationFunction[INTERFACE_ID]).toBe(areValidInterfaceIds);
  });
});

describe('validate useIsAclpSupportedRegion function', () => {
  // - Mocked 'monitors' data used here may differ from the actual /regions API response.
  const mockRegions = [
    regionFactory.build({
      country: 'us',
      id: 'us-iad',
      label: 'Washington, DC',
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Linodes'],
      },
    }),
    regionFactory.build({
      country: 'us',
      id: 'us-east',
      label: 'Newark, NJ',
      monitors: {
        alerts: ['Linodes'],
        metrics: ['Linodes'],
      },
    }),
    regionFactory.build({
      country: 'ca',
      id: 'ca-central',
      label: 'Toronto',
      monitors: { alerts: [], metrics: [] },
    }),
    regionFactory.build({
      country: 'in',
      id: 'in-maa',
      label: 'Chennai',
    }),
  ];

  const queryMocks = vi.hoisted(() => ({
    useRegionsQuery: vi.fn(),
  }));

  vi.mock('@linode/queries', async () => {
    const actual = await vi.importActual('@linode/queries');

    return {
      ...actual,
      useRegionsQuery: queryMocks.useRegionsQuery,
    };
  });

  beforeEach(() => {
    queryMocks.useRegionsQuery.mockReturnValue({
      isLoading: false,
      data: mockRegions,
    });
  });

  it('should return true if Linodes is requested in supported region (us-iad, us-east) for the metrics and alert monitoring type', () => {
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'us-iad',
        type: 'metrics',
      })
    ).toBe(true);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'us-east',
        type: 'metrics',
      })
    ).toBe(true);

    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'us-iad',
        type: 'alerts',
      })
    ).toBe(true);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'us-east',
        type: 'alerts',
      })
    ).toBe(true);
  });

  it('should return false if Linodes is requested in unsupported regions (us-ord, ca-central) for the metrics monitoring type', () => {
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'us-ord',
        type: 'metrics',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'ca-central',
        type: 'metrics',
      })
    ).toBe(false);
  });

  it('should return false if both metrics and alerts list are empty', () => {
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'ca-central',
        type: 'metrics',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'ca-central',
        type: 'alerts',
      })
    ).toBe(false);
  });

  it('should return false if monitors property is undefined for the metrics or alerts monitoring type', () => {
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'in-maa',
        type: 'metrics',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'in-maa',
        type: 'alerts',
      })
    ).toBe(false);
  });

  it('should return false if the capability is not supported by the monitoring types for the selectedRegion', () => {
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'ca-central',
        type: 'metrics',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Managed Databases',
        regionId: 'us-iad',
        type: 'metrics',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Linodes',
        regionId: 'ca-central',
        type: 'alerts',
      })
    ).toBe(false);
    expect(
      useIsAclpSupportedRegion({
        capability: 'Managed Databases',
        regionId: 'us-iad',
        type: 'alerts',
      })
    ).toBe(false);
  });
});
