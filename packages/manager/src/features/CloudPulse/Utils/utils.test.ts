import { regionFactory } from '@linode/utilities';
import { describe, expect, it } from 'vitest';

import { kubernetesClusterFactory, serviceTypesFactory } from 'src/factories';
import {
  firewallEntityfactory,
  firewallFactory,
} from 'src/factories/firewalls';

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
  filterFirewallResources,
  filterKubernetesClusters,
  getAssociatedEntityType,
  getEnabledServiceTypes,
  getFilteredDimensions,
  getResourcesFilterConfig,
  isValidFilter,
  isValidPort,
  useIsAclpSupportedRegion,
  validationFunction,
} from './utils';

import type { FetchOptions } from '../Alerts/CreateAlert/Criteria/DimensionFilterValue/constants';
import type { MetricsDimensionFilter } from '../Widget/components/DimensionFilters/types';
import type { Dimension } from '@linode/api-v4';
import type { AclpServices } from 'src/featureFlags';

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

  it('should return invalid for input length more than 100 characters', () => {
    expect(
      arePortsValid(
        '12345,23456,34567,45678,56789,123,456,789,1111,2222,3333,4444,5555,6666,7777,8888,9999,12,34,56,1055'
      )
    ).toBe(undefined);
    expect(
      arePortsValid(
        '12345,23456,34567,45678,56789,123,456,789,1111,2222,3333,4444,5555,6666,7777,8888,9999,12,34,56,10455'
      )
    ).toBe(PORTS_LIMIT_ERROR_MESSAGE);
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

  it('should return invalid for input length more than 100 characters', () => {
    expect(
      areValidInterfaceIds(
        '12345,23456,34567,45678,56789,123,456,789,1111,2222,3333,4444,5555,6666,7777,8888,9999,12,34,56,1455'
      )
    ).toBe(undefined);
    expect(
      areValidInterfaceIds(
        '12345,23456,34567,45678,56789,123,456,789,1111,2222,3333,4444,5555,6666,7777,8888,9999,12,34,56,14055'
      )
    ).toBe(INTERFACE_IDS_LIMIT_ERROR_MESSAGE);
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

describe('getEnabledServiceTypes', () => {
  const serviceTypesList = {
    data: [
      serviceTypesFactory.build({ service_type: 'dbaas' }),
      serviceTypesFactory.build({ service_type: 'linode' }),
    ],
  };

  it('should return empty list when no service types are provided', () => {
    const result = getEnabledServiceTypes(undefined, undefined);
    expect(result).toHaveLength(0);
  });

  it('should return enabled service types', () => {
    const aclpServicesFlag: Partial<AclpServices> = {
      linode: {
        alerts: { enabled: false, beta: true },
        metrics: { enabled: false, beta: true },
      },
      dbaas: {
        alerts: { enabled: true, beta: true },
        metrics: { enabled: true, beta: true },
      },
    };
    const result = getEnabledServiceTypes(serviceTypesList, aclpServicesFlag);
    expect(result).toEqual(['dbaas']);
  });

  it('should not return the service type which is missing from the aclpServices flag', () => {
    const aclpServicesFlag: Partial<AclpServices> = {
      linode: {
        alerts: { enabled: true, beta: true },
        metrics: { enabled: true, beta: true },
      },
    };
    const result = getEnabledServiceTypes(serviceTypesList, aclpServicesFlag);
    expect(result).not.toContain('dbaas');
  });

  it('should not return the service type if the metrics property is not present in the aclpServices flag', () => {
    const aclpServicesFlag: Partial<AclpServices> = {
      linode: {
        alerts: { enabled: true, beta: true },
      },
    };
    const result = getEnabledServiceTypes(serviceTypesList, aclpServicesFlag);
    expect(result).not.toContain('linode');
  });

  describe('getResourcesFilterConfig', () => {
    it('should return undefined if the dashboard id is not provided', () => {
      expect(getResourcesFilterConfig(undefined)).toBeUndefined();
    });

    it('should return the resources filter configuration for the linode-firewalldashboard', () => {
      const resourcesFilterConfig = getResourcesFilterConfig(4);
      expect(resourcesFilterConfig).toBeDefined();
      expect(resourcesFilterConfig?.associatedEntityType).toBe('linode');
    });

    it('should return the resources filter configuration for the nodebalancer-firewall dashboard', () => {
      const resourcesFilterConfig = getResourcesFilterConfig(8);
      expect(resourcesFilterConfig).toBeDefined();
      expect(resourcesFilterConfig?.associatedEntityType).toBe('nodebalancer');
    });
  });

  describe('getAssociatedEntityType', () => {
    it('should return undefined if the dashboard id is not provided', () => {
      expect(getAssociatedEntityType(undefined)).toBeUndefined();
    });

    it('should return the associated entity type for the linode-firewall dashboard', () => {
      expect(getAssociatedEntityType(4)).toBe('linode');
    });

    it('should return the associated entity type for the nodebalancer-firewall dashboard', () => {
      expect(getAssociatedEntityType(8)).toBe('nodebalancer');
    });
  });

  describe('filterFirewallResources', () => {
    it('should return the filtered firewall resources for linode', () => {
      const resources = [
        firewallFactory.build({
          entities: [
            firewallEntityfactory.build({
              id: 1,
              label: 'linode-1',
              type: 'linode',
            }),
          ],
        }),
        firewallFactory.build({
          entities: [
            firewallEntityfactory.build({
              id: 33,
              label: null,
              type: 'linode_interface',
              parent_entity: {
                id: 2,
                label: 'linode-2',
                type: 'linode',
              },
            }),
          ],
        }),
        firewallFactory.build({
          entities: [
            firewallEntityfactory.build({
              id: 3,
              label: null,
              type: 'linode',
            }),
          ],
        }),
        firewallFactory.build({
          entities: [
            firewallEntityfactory.build({
              id: 4,
              label: null,
              type: 'linode_interface',
              parent_entity: {
                id: 3,
                label: null,
                type: 'linode',
              },
            }),
          ],
        }),
        firewallFactory.build({
          entities: [
            firewallEntityfactory.build({
              id: 2,
              label: 'nodebalancer-1',
              type: 'nodebalancer',
            }),
          ],
        }),
      ];
      expect(filterFirewallResources(resources, 'linode')).toEqual([
        resources[0],
        resources[1],
      ]);
    });
  });
});

describe('filterKubernetesClusters', () => {
  it('should return the filtered kubernetes clusters for enterprise', () => {
    const clusters = [
      ...kubernetesClusterFactory.buildList(5, { tier: 'standard' }),
      ...kubernetesClusterFactory.buildList(5, { tier: 'enterprise' }),
    ];
    expect(filterKubernetesClusters(clusters)).toHaveLength(5);
  });
  it('should return the filtered kubernetes clusters for enterprise sorted by label', () => {
    const clusters = [
      kubernetesClusterFactory.build({
        tier: 'enterprise',
        label: 'pl-labkrk-2-redis-cluster',
      }),
      kubernetesClusterFactory.build({
        tier: 'enterprise',
        label: 'pl-labkrk-2-mr-api-4',
      }),
      kubernetesClusterFactory.build({
        tier: 'enterprise',
        label: 'pl-labkrk-2-alertmanager2',
      }),
      kubernetesClusterFactory.build({
        tier: 'enterprise',
        label: 'pl-labkrk-2-alertmanager',
      }),
    ];

    expect(filterKubernetesClusters(clusters)[0].label).toBe(
      'pl-labkrk-2-alertmanager'
    );
    expect(filterKubernetesClusters(clusters)[1].label).toBe(
      'pl-labkrk-2-alertmanager2'
    );
    expect(filterKubernetesClusters(clusters)[2].label).toBe(
      'pl-labkrk-2-mr-api-4'
    );
    expect(filterKubernetesClusters(clusters)[3].label).toBe(
      'pl-labkrk-2-redis-cluster'
    );
  });
});

describe('isValidFilter', () => {
  const valuedDim: Dimension = {
    dimension_label: 'browser',
    label: 'Browser',
    values: ['chrome', 'firefox', 'safari'],
  };

  const staticDim: Dimension = {
    dimension_label: 'browser',
    label: 'Browser',
    values: [],
  };

  it('returns false when operator is missing', () => {
    const filter = {
      dimension_label: 'browser',
      operator: null,
      value: 'chrome',
    };
    expect(isValidFilter(filter, [valuedDim])).toBe(false);
  });

  it('returns false when the dimension_label is not present in options', () => {
    const filter: MetricsDimensionFilter = {
      dimension_label: 'os',
      operator: 'eq',
      value: 'linux',
    };
    expect(isValidFilter(filter, [valuedDim])).toBe(false);
  });

  it('returns true for static dimensions (no values array) regardless of value', () => {
    const filter: MetricsDimensionFilter = {
      dimension_label: 'browser',
      operator: 'startswith',
      value: 'chrome',
    };
    expect(isValidFilter(filter, [staticDim])).toBe(true);
  });

  it('allows pattern operators ("endswith" / "startswith") even without validating values', () => {
    const f1: MetricsDimensionFilter = {
      dimension_label: 'browser',
      operator: 'endswith',
      value: 'fox',
    };
    const f2: MetricsDimensionFilter = {
      dimension_label: 'browser',
      operator: 'startswith',
      value: 'chr',
    };
    expect(isValidFilter(f1, [valuedDim])).toBe(true);
    expect(isValidFilter(f2, [valuedDim])).toBe(true);
  });

  it('returns true when multiple comma-separated values are all valid', () => {
    const filter: MetricsDimensionFilter = {
      dimension_label: 'browser',
      operator: 'in',
      value: 'chrome,firefox',
    };
    expect(isValidFilter(filter, [valuedDim])).toBe(true);
  });

  it('returns false when value is empty string for a dimension that expects values', () => {
    const filter: MetricsDimensionFilter = {
      dimension_label: 'browser',
      operator: 'eq',
      value: '',
    };
    expect(isValidFilter(filter, [valuedDim])).toBe(false);
  });
});

describe('getFilteredDimensions', () => {
  it('returns [] when no dimensionFilters provided', () => {
    const dimensions: Dimension[] = [
      { dimension_label: 'linode_id', values: [], label: 'Linode' },
      { dimension_label: 'vpc_subnet_id', values: [], label: 'Linode' },
    ];

    const linodes: FetchOptions = {
      values: [{ label: 'L1', value: 'lin-1' }],
      isError: false,
      isLoading: false,
    };
    const vpcs: FetchOptions = {
      values: [{ label: 'V1', value: 'vpc-1' }],
      isError: false,
      isLoading: false,
    };

    const result = getFilteredDimensions({
      dimensions,
      linodes,
      vpcs,
      dimensionFilters: [],
    });
    expect(result).toEqual([]);
  });

  it('merges linode and vpc values into metric dimensions and keeps valid filters', () => {
    const dimensions: Dimension[] = [
      { dimension_label: 'linode_id', values: [], label: 'Linode' },
      { dimension_label: 'vpc_subnet_id', values: [], label: 'VPC subnet ID' },
      {
        dimension_label: 'browser',
        values: ['chrome', 'firefox'],
        label: 'browser',
      },
    ];

    const linodes: FetchOptions = {
      values: [{ label: 'L1', value: 'lin-1' }],
      isError: false,
      isLoading: false,
    };
    const vpcs: FetchOptions = {
      values: [{ label: 'V1', value: 'vpc-1' }],
      isError: false,
      isLoading: false,
    };

    const filters: MetricsDimensionFilter[] = [
      { dimension_label: 'linode_id', operator: 'eq', value: 'lin-1' },
      { dimension_label: 'vpc_subnet_id', operator: 'eq', value: 'vpc-1' },
      { dimension_label: 'browser', operator: 'in', value: 'chrome' },
    ];

    const result = getFilteredDimensions({
      dimensions,
      linodes,
      vpcs,
      dimensionFilters: filters,
    });

    // all three filters are valid against mergedDimensions
    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(filters));
  });

  it('filters out invalid filters (values not present in merged dimension values)', () => {
    const dimensions: Dimension[] = [
      { dimension_label: 'linode_id', values: [], label: 'Linode' },
      {
        dimension_label: 'vpc_subnet_id',
        values: [],
        label: 'VPC subnet Id',
      },
      {
        dimension_label: 'browser',
        values: ['chrome', 'firefox'],
        label: 'Browser',
      },
    ];

    const linodes: FetchOptions = {
      values: [{ label: 'L1', value: 'lin-1' }],
      isError: false,
      isLoading: false,
    };
    const vpcs: FetchOptions = {
      values: [{ label: 'V1', value: 'vpc-1' }],
      isError: false,
      isLoading: false,
    };

    const filters: MetricsDimensionFilter[] = [
      { dimension_label: 'linode_id', operator: 'eq', value: 'lin-1' },
      { dimension_label: 'vpc_subnet_id', operator: 'eq', value: 'vpc-1' },
      // invalid browser value -- should be removed
      { dimension_label: 'browser', operator: 'in', value: 'edge' },
    ];

    const result = getFilteredDimensions({
      dimensions,
      linodes,
      vpcs,
      dimensionFilters: filters,
    });

    // only the two valid filters should remain
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        { dimension_label: 'linode_id', operator: 'eq', value: 'lin-1' },
        { dimension_label: 'vpc_subnet_id', operator: 'eq', value: 'vpc-1' },
      ])
    );
    // invalid 'browser' filter must be absent
    expect(result).toEqual(
      expect.not.arrayContaining([
        { dimension_label: 'browser', operator: 'in', value: 'edge' },
      ])
    );
  });

  it('returns [] when dimensions is empty', () => {
    const linodes: FetchOptions = {
      values: [{ label: 'L1', value: 'lin-1' }],
      isError: false,
      isLoading: false,
    };
    const vpcs: FetchOptions = {
      values: [{ label: 'V1', value: 'vpc-1' }],
      isError: false,
      isLoading: false,
    };

    const filters: MetricsDimensionFilter[] = [
      { dimension_label: 'linode_id', operator: 'eq', value: 'lin-1' },
    ];

    const result = getFilteredDimensions({
      dimensions: [],
      linodes,
      vpcs,
      dimensionFilters: filters,
    });

    // with no metric definitions, mergedDimensions is undefined and filters should not pass validation
    expect(result).toEqual([]);
  });
});
