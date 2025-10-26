import { databaseQueries } from '@linode/queries';
import { nodeBalancerFactory } from '@linode/utilities';
import { DateTime } from 'luxon';

import {
  dashboardFactory,
  databaseInstanceFactory,
  objectStorageEndpointsFactory,
} from 'src/factories';

import { RESOURCE_ID, RESOURCES } from './constants';
import {
  deepEqual,
  filterBasedOnConfig,
  filterEndpointsUsingRegion,
  filterFirewallNodebalancers,
  filterUsingDependentFilters,
  getEndpointsProperties,
  getFilters,
  getFirewallNodebalancersProperties,
  getTextFilterProperties,
} from './FilterBuilder';
import {
  checkIfAllMandatoryFiltersAreSelected,
  constructAdditionalRequestFilters,
  getCustomSelectProperties,
  getMetricsCallCustomFilters,
  getNodeTypeProperties,
  getRegionProperties,
  getResourcesProperties,
  getTimeDurationProperties,
  shouldDisableFilterByFilterKey,
} from './FilterBuilder';
import { FILTER_CONFIG } from './FilterConfig';
import { CloudPulseAvailableViews, CloudPulseSelectTypes } from './models';

import type { CloudPulseEndpoints } from '../shared/CloudPulseEndpointsSelect';
import type { CloudPulseResources } from '../shared/CloudPulseResourcesSelect';
import type { CloudPulseServiceTypeFilters } from './models';

const mockDashboard = dashboardFactory.build();

const linodeConfig = FILTER_CONFIG.get(2);

const dbaasConfig = FILTER_CONFIG.get(1);

const nodeBalancerConfig = FILTER_CONFIG.get(3);

const linodeFirewallConfig = FILTER_CONFIG.get(4);

const nodebalancerFirewallConfig = FILTER_CONFIG.get(8);

const dbaasDashboard = dashboardFactory.build({ service_type: 'dbaas', id: 1 });

const objectStorageBucketDashboard = dashboardFactory.build({
  service_type: 'objectstorage',
  id: 6,
});

const objectStorageBucketConfig = FILTER_CONFIG.get(6);

it('test getRegionProperties method', () => {
  const regionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Region'
  );

  expect(regionConfig).toBeDefined();

  if (regionConfig) {
    const { handleRegionChange, label, selectedDashboard } =
      getRegionProperties(
        {
          config: regionConfig,
          dashboard: mockDashboard,
          isServiceAnalyticsIntegration: false,
        },
        vi.fn()
      );
    const { name } = regionConfig.configuration;
    expect(handleRegionChange).toBeDefined();
    expect(selectedDashboard).toEqual(mockDashboard);
    expect(label).toEqual(name);
  }
});

it('test getTimeDuratonProperties method', () => {
  const timeDurationConfig = linodeConfig?.filters.find(
    ({ name }) => name === 'Time Range'
  );

  expect(timeDurationConfig).toBeDefined();

  if (timeDurationConfig) {
    const { handleStatsChange, label, savePreferences } =
      getTimeDurationProperties(
        {
          config: timeDurationConfig,
          dashboard: mockDashboard,
          isServiceAnalyticsIntegration: false,
        },
        vi.fn()
      );
    const { name } = timeDurationConfig.configuration;
    expect(handleStatsChange).toBeDefined();
    expect(savePreferences).toEqual(true);
    expect(label).toEqual(name);
  }
});

it('test getResourceSelectionProperties method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  if (resourceSelectionConfig) {
    const {
      disabled,
      handleResourcesSelection,
      label,
      savePreferences,
      xFilter,
    } = getResourcesProperties(
      {
        config: resourceSelectionConfig,
        dashboard: { ...mockDashboard, id: 2 },
        dependentFilters: { region: 'us-east' },
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    const { name } = resourceSelectionConfig.configuration;
    expect(handleResourcesSelection).toBeDefined();
    expect(savePreferences).toEqual(false);
    expect(disabled).toEqual(false);
    expect(JSON.stringify(xFilter)).toEqual('{"region":"us-east"}');
    expect(label).toEqual(name);
  }
});

it('test getResourceSelectionProperties method for linode-firewall', () => {
  const resourceSelectionConfig = linodeFirewallConfig?.filters.find(
    (filterObj) => filterObj.name === 'Firewalls'
  );

  expect(resourceSelectionConfig).toBeDefined();

  if (resourceSelectionConfig) {
    const {
      disabled,
      handleResourcesSelection,
      label,
      savePreferences,
      filterFn,
    } = getResourcesProperties(
      {
        config: resourceSelectionConfig,
        dashboard: { ...mockDashboard, id: 4 },
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    const { name } = resourceSelectionConfig.configuration;
    expect(handleResourcesSelection).toBeDefined();
    expect(savePreferences).toEqual(false);
    expect(disabled).toEqual(false);
    expect(label).toEqual(name);
    expect(filterFn).toBeDefined();
  }
});

it('test getResourceSelectionProperties method with disabled true', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  if (resourceSelectionConfig) {
    const {
      disabled,
      handleResourcesSelection,
      label,
      savePreferences,
      xFilter,
    } = getResourcesProperties(
      {
        config: resourceSelectionConfig,
        dashboard: mockDashboard,
        dependentFilters: {},
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    const { name } = resourceSelectionConfig.configuration;
    expect(handleResourcesSelection).toBeDefined();
    expect(savePreferences).toEqual(false);
    expect(disabled).toEqual(true);
    expect(JSON.stringify(xFilter)).toEqual('{}');
    expect(label).toEqual(name);
  }
});

describe('shouldDisableFilterByFilterKey', () => {
  // resources filter has region as mandatory filter, this should reflect in the dependent filters
  it('should enable filter when dependent filter region is provided', () => {
    const result = shouldDisableFilterByFilterKey(
      'resource_id',
      { region: 'us-east' },
      { ...mockDashboard, id: 2 }
    );
    expect(result).toEqual(false);
  });

  it('should disable filter when dependent filter region is undefined', () => {
    const result = shouldDisableFilterByFilterKey(
      'resource_id',
      { region: undefined },
      mockDashboard
    );
    expect(result).toEqual(true);
  });

  it('should disable filter when no dependent filters are provided', () => {
    const result = shouldDisableFilterByFilterKey(
      'resource_id',
      {},
      mockDashboard
    );
    expect(result).toEqual(true);
  });

  it('should disable filter when required dependent filter is undefined in dependent filters but defined in preferences', () => {
    const result = shouldDisableFilterByFilterKey(
      'resource_id',
      {},
      mockDashboard,
      { region: 'us-east' } // region is still not defined, so the result should be true
    );
    expect(result).toEqual(true);
  });
});

it('test getNodeTypeProperties', () => {
  const nodeTypeSelectionConfig = dbaasConfig?.filters.find(
    (filterObj) => filterObj.name === 'Node Type'
  );

  expect(nodeTypeSelectionConfig).toBeDefined();

  if (nodeTypeSelectionConfig) {
    const {
      database_ids,
      disabled,
      handleNodeTypeChange,
      label,
      savePreferences,
    } = getNodeTypeProperties(
      {
        config: nodeTypeSelectionConfig,
        dashboard: dbaasDashboard,
        dependentFilters: { [RESOURCE_ID]: [1] },
        isServiceAnalyticsIntegration: false,
        resource_ids: [1],
      },
      vi.fn()
    );
    const { name } = nodeTypeSelectionConfig.configuration;
    expect(database_ids).toEqual([1]);
    expect(handleNodeTypeChange).toBeDefined();
    expect(savePreferences).toEqual(true);
    expect(disabled).toEqual(false);
    expect(label).toEqual(name);
  }
});

it('test getNodeTypeProperties with disabled true', () => {
  const nodeTypeSelectionConfig = dbaasConfig?.filters.find(
    (filterObj) => filterObj.name === 'Node Type'
  );

  expect(nodeTypeSelectionConfig).toBeDefined();

  if (nodeTypeSelectionConfig) {
    const { disabled, handleNodeTypeChange, label, savePreferences } =
      getNodeTypeProperties(
        {
          config: nodeTypeSelectionConfig,
          dashboard: dbaasDashboard,
          dependentFilters: {},
          isServiceAnalyticsIntegration: false,
        },
        vi.fn()
      );
    const { name } = nodeTypeSelectionConfig.configuration;
    expect(handleNodeTypeChange).toBeDefined();
    expect(savePreferences).toEqual(true);
    expect(disabled).toEqual(true);
    expect(label).toEqual(name);
  }
});

it('test checkIfAllMandatoryFiltersAreSelected method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();
  const now = DateTime.now();
  let result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: { ...mockDashboard, id: 2 },
    filterValue: { region: 'us-east', resource_id: ['1', '2'] },
    timeDuration: {
      end: now.toISO(),
      preset: '30minutes',
      start: now.minus({ minutes: 30 }).toISO(),
    },
  });

  expect(result).toEqual(true);

  result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: mockDashboard,
    filterValue: { region: 'us-east' },
    timeDuration: {
      end: now.toISO(),
      preset: '30minutes',
      start: now.minus({ minutes: 30 }).toISO(),
    },
  });

  expect(result).toEqual(false);

  result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: mockDashboard,
    filterValue: { region: 'us-east', resource_id: ['1', '2'] },
    timeDuration: undefined,
  });

  expect(result).toEqual(false);
});

it('test getCustomSelectProperties method', () => {
  const customSelectEngineConfig = dbaasConfig?.filters.find(
    (filterObj) => filterObj.name === 'DB Engine'
  );

  expect(customSelectEngineConfig).toBeDefined();

  if (customSelectEngineConfig) {
    const {
      clearDependentSelections,
      disabled,
      isMultiSelect,
      label,
      options,
      savePreferences,
    } = getCustomSelectProperties(
      {
        config: customSelectEngineConfig,
        dashboard: { ...mockDashboard, service_type: 'dbaas' },
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );

    expect(options).toBeDefined();
    expect(options?.length).toEqual(2);
    expect(savePreferences).toEqual(false);
    expect(isMultiSelect).toEqual(false);
    expect(label).toEqual(customSelectEngineConfig.configuration.name);
    expect(disabled).toEqual(false);
    expect(clearDependentSelections).toBeDefined();
    expect(clearDependentSelections?.includes(RESOURCES)).toBe(true);

    customSelectEngineConfig.configuration.type = CloudPulseSelectTypes.dynamic;
    customSelectEngineConfig.configuration.apiV4QueryKey =
      databaseQueries.engines;
    customSelectEngineConfig.configuration.isMultiSelect = true;
    customSelectEngineConfig.configuration.options = undefined;

    const {
      apiV4QueryKey,
      isMultiSelect: isMultiSelectApi,
      savePreferences: savePreferencesApi,
      type,
      filterFn,
    } = getCustomSelectProperties(
      {
        config: customSelectEngineConfig,
        dashboard: mockDashboard,
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );

    const { name } = customSelectEngineConfig.configuration;

    expect(apiV4QueryKey).toEqual(databaseQueries.engines);
    expect(type).toEqual(CloudPulseSelectTypes.dynamic);
    expect(savePreferencesApi).toEqual(false);
    expect(isMultiSelectApi).toEqual(true);
    expect(label).toEqual(name);
    expect(filterFn).not.toBeDefined();
  }
});

it('test getTextFilterProperties method for port', () => {
  const portFilterConfig = nodeBalancerConfig?.filters.find(
    (filterObj) => filterObj.name === 'Ports'
  );

  expect(portFilterConfig).toBeDefined();

  if (portFilterConfig) {
    const { handleTextFilterChange, label, savePreferences } =
      getTextFilterProperties(
        {
          config: portFilterConfig,
          dashboard: dashboardFactory.build({ service_type: 'nodebalancer' }),
          isServiceAnalyticsIntegration: false,
        },
        vi.fn()
      );

    expect(handleTextFilterChange).toBeDefined();
    expect(label).toEqual(portFilterConfig.configuration.name);
    expect(savePreferences).toEqual(true);
  }
});

it('test getTextFilterProperties method for interface_id', () => {
  const interfaceIdFilterConfig = linodeFirewallConfig?.filters.find(
    (filterObj) => filterObj.name === 'Interface IDs'
  );

  expect(interfaceIdFilterConfig).toBeDefined();

  if (interfaceIdFilterConfig) {
    const { handleTextFilterChange, label, savePreferences } =
      getTextFilterProperties(
        {
          config: interfaceIdFilterConfig,
          dashboard: dashboardFactory.build({ service_type: 'firewall' }),
          isServiceAnalyticsIntegration: false,
        },
        vi.fn()
      );

    expect(handleTextFilterChange).toBeDefined();
    expect(label).toEqual(interfaceIdFilterConfig.configuration.name);
    expect(savePreferences).toEqual(true);
  }
});

it('test getEndpointsProperties method', () => {
  const endpointsConfig = objectStorageBucketConfig?.filters.find(
    (filterObj) => filterObj.name === 'Endpoints'
  );

  expect(endpointsConfig).toBeDefined();

  if (endpointsConfig) {
    const endpointsProperties = getEndpointsProperties(
      {
        config: endpointsConfig,
        dashboard: objectStorageBucketDashboard,
        dependentFilters: { region: 'us-east' },
        isServiceAnalyticsIntegration: false,
      },
      vi.fn()
    );
    const {
      label,
      serviceType,
      disabled,
      savePreferences,
      handleEndpointsSelection,
      defaultValue,
      region,
      xFilter,
    } = endpointsProperties;

    expect(endpointsProperties).toBeDefined();
    expect(label).toEqual(endpointsConfig.configuration.name);
    expect(serviceType).toEqual('objectstorage');
    expect(savePreferences).toEqual(true);
    expect(disabled).toEqual(false);
    expect(handleEndpointsSelection).toBeDefined();
    expect(defaultValue).toEqual(undefined);
    expect(region).toEqual('us-east');
    expect(xFilter).toEqual({ region: 'us-east' });
  }
});
it('test getFirewallNodebalancersProperties', () => {
  const nodebalancersConfig = nodebalancerFirewallConfig?.filters.find(
    (filterObj) => filterObj.name === 'NodeBalancers'
  );

  expect(nodebalancersConfig).toBeDefined();

  if (nodebalancersConfig) {
    const nodebalancersProperties = getFirewallNodebalancersProperties(
      {
        config: nodebalancersConfig,
        dashboard: dashboardFactory.build({ service_type: 'firewall', id: 8 }),
        dependentFilters: {
          resource_id: '1',
          associated_entity_region: 'us-east',
        },
        isServiceAnalyticsIntegration: false,
      },
      vi.fn()
    );
    const {
      label,
      serviceType,
      disabled,
      savePreferences,
      handleNodebalancersSelection,
      defaultValue,
      xFilter,
    } = nodebalancersProperties;

    expect(nodebalancersProperties).toBeDefined();
    expect(label).toEqual(nodebalancersConfig.configuration.name);
    expect(serviceType).toEqual('firewall');
    expect(savePreferences).toEqual(true);
    expect(disabled).toEqual(false);
    expect(handleNodebalancersSelection).toBeDefined();
    expect(defaultValue).toEqual(undefined);
    expect(xFilter).toEqual({
      resource_id: '1',
      associated_entity_region: 'us-east',
    });
  }
});

it('test getFiltersForMetricsCallFromCustomSelect method', () => {
  const result = getMetricsCallCustomFilters(
    {
      resource_id: [1, 2, 3],
    },
    2
  );

  expect(result).toBeDefined();
  expect(result.length).toEqual(0);
});

it('test constructAdditionalRequestFilters method', () => {
  const result = constructAdditionalRequestFilters(
    getMetricsCallCustomFilters(
      {
        resource_id: [1, 2, 3],
      },
      2
    )
  );

  expect(result).toBeDefined();
  expect(result.length).toEqual(0);
});

it('test constructAdditionalRequestFilters method with empty filter value', () => {
  const result = constructAdditionalRequestFilters([
    {
      filterKey: 'protocol',
      filterValue: [],
    },
    {
      filterKey: 'port',
      filterValue: [],
    },
  ]);

  expect(result).toBeDefined();
  expect(result.length).toEqual(0);
});

it('returns true for identical primitive values', () => {
  expect(deepEqual(1, 1)).toBe(true);
  expect(deepEqual('test', 'test')).toBe(true);
  expect(deepEqual(true, true)).toBe(true);
});

it('returns false for different primitive values', () => {
  expect(deepEqual(1, 2)).toBe(false);
  expect(deepEqual('test', 'other')).toBe(false);
  expect(deepEqual(true, false)).toBe(false);
});

it('returns true for identical objects', () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: 1, b: { c: 2 } };
  expect(deepEqual(obj1, obj2)).toBe(true);
});

it('returns false for different objects', () => {
  const obj1 = { a: 1, b: { c: 2 } };
  const obj2 = { a: 1, b: { c: 3 } };
  expect(deepEqual(obj1, obj2)).toBe(false);
});

it('returns true for identical arrays', () => {
  const arr1 = [1, 2, 3];
  const arr2 = [1, 2, 3];
  expect(deepEqual(arr1, arr2)).toBe(true);
});

it('returns false for different arrays', () => {
  const arr1 = [1, 2, 3];
  const arr2 = [1, 2, 4];
  expect(deepEqual(arr1, arr2)).toBe(false);
});

it('should return the filters based on dashboard', () => {
  const filters = getFilters(dashboardFactory.build({ id: 1 }), true);

  expect(filters?.length).toBe(1);
});

describe('filterUsingDependentFilters', () => {
  const mockData: CloudPulseResources[] = [
    {
      ...databaseInstanceFactory.build(),
      region: 'us-east',
      engineType: 'mysql',
      id: '1',
      tags: ['test'],
    },
    {
      ...databaseInstanceFactory.build(),
      region: 'us-west',
      engineType: 'postgresql',
      id: '2',
      tags: ['test', 'test2'],
    },
  ];
  it('should return the data passed if data or dependentFilters are undefined', () => {
    expect(filterUsingDependentFilters(undefined, undefined)).toBeUndefined();
    expect(filterUsingDependentFilters(mockData, undefined)).toBe(mockData);
    expect(filterUsingDependentFilters(undefined, {})).toBeUndefined();
  });

  it('should filter based on a single key-value match', () => {
    const filters = { engineType: 'mysql' };
    const result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([mockData[0]]);
  });

  it('should filter when both resource and filter value are arrays', () => {
    const filters = { tags: ['test', 'test2'] };
    const result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([mockData[0], mockData[1]]);
  });

  it('should return empty array if no resource matches', () => {
    const filters = { region: 'us-central' };
    const result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([]);
  });

  it('should apply multiple filters simultaneously', () => {
    let filters = {
      engineType: 'postgresql',
      region: 'us-east',
      tags: 'test',
    };
    let result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([]);

    filters = {
      engineType: 'postgresql',
      region: 'us-east',
      tags: 'test',
    };

    result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([]);

    filters = {
      engineType: 'postgresql',
      region: 'us-west',
      tags: 'test',
    };

    result = filterUsingDependentFilters(mockData, filters);
    expect(result).toEqual([mockData[1]]);
  });
});

describe('filterEndpointsUsingRegion', () => {
  const mockData: CloudPulseEndpoints[] = [
    {
      ...objectStorageEndpointsFactory.build({ region: 'us-east' }),
      label: 'us-east-1.linodeobjects.com',
    },
    {
      ...objectStorageEndpointsFactory.build({ region: 'us-west' }),
      label: 'us-west-1.linodeobjects.com',
    },
  ];
  it('should return data as is if data is undefined', () => {
    expect(
      filterEndpointsUsingRegion(undefined, { region: 'us-east' })
    ).toEqual(undefined);
  });
  it('should return undefined if region filter is undefined', () => {
    expect(filterEndpointsUsingRegion(mockData, undefined)).toEqual(undefined);
  });
  it('should return endpoints based on region if region filter is provided', () => {
    expect(filterEndpointsUsingRegion(mockData, { region: 'us-east' })).toEqual(
      [mockData[0]]
    );
  });
});

describe('filterFirewallNodebalancers', () => {
  const mockData = [
    nodeBalancerFactory.build({
      id: 1,
      label: 'nodebalancer-1',
      region: 'us-east',
    }),
    nodeBalancerFactory.build({
      id: 2,
      label: 'nodebalancer-2',
      region: 'us-west',
    }),
  ];
  const mockFirewalls: CloudPulseResources[] = [
    {
      id: '1',
      label: 'firewall-1',
      entities: { '1': 'nodebalancer-1' },
    },
  ];

  it('should return undefined if data is undefined', () => {
    expect(
      filterFirewallNodebalancers(
        undefined,
        { associated_entity_region: 'us-east', resource_id: '1' },
        mockFirewalls
      )
    ).toEqual(undefined);
  });

  it('should return mapped nodebalancers if xFilter is undefined', () => {
    const result = filterFirewallNodebalancers(
      mockData,
      undefined,
      mockFirewalls
    );
    expect(result).toEqual([
      {
        id: '1',
        label: 'nodebalancer-1',
        associated_entity_region: 'us-east',
      },
      {
        id: '2',
        label: 'nodebalancer-2',
        associated_entity_region: 'us-west',
      },
    ]);
  });

  it('should filter nodebalancers based on xFilter', () => {
    const result = filterFirewallNodebalancers(
      mockData,
      { associated_entity_region: 'us-east', resource_id: '1' },
      mockFirewalls
    );
    expect(result).toEqual([
      {
        id: '1',
        label: 'nodebalancer-1',
        associated_entity_region: 'us-east',
      },
    ]);
  });
});

describe('filterBasedOnConfig', () => {
  const config: CloudPulseServiceTypeFilters = {
    configuration: {
      dependency: [], // empty dependency
      filterKey: 'resource_id',
      filterType: 'string',
      isFilterable: true,
      isMetricsFilter: true,
      isMultiSelect: true,
      name: 'Database Clusters',
      neededInViews: [CloudPulseAvailableViews.central],
      placeholder: 'Select Database Clusters',
      priority: 3,
    },
    name: 'Resources',
  };
  it('should return empty object if config has no dependencies', () => {
    const dependentFilters = { engine: 'mysql', region: 'us-east' };
    const result = filterBasedOnConfig(config, dependentFilters);
    expect(result).toEqual({});
  });

  it('should return filtered values based on dependency keys', () => {
    const dependentFilters = {
      engine: 'mysql',
      region: 'us-east',
      status: 'running',
    };
    const result = filterBasedOnConfig(
      {
        ...config,
        configuration: {
          ...config.configuration,
          dependency: ['engine', 'status'],
        },
      },
      dependentFilters
    );
    expect(result).toEqual({
      engineType: 'mysql',
      status: 'running',
    });
  });

  it('should work with array values in filters', () => {
    const dependentFilters = {
      engine: 'mysql',
      tags: ['db', 'prod'],
    };
    const result = filterBasedOnConfig(
      {
        ...config,
        configuration: {
          ...config.configuration,
          dependency: ['engine', 'tags'],
        },
      },
      dependentFilters
    );
    expect(result).toEqual({
      engineType: 'mysql',
      tags: ['db', 'prod'],
    });
  });
});
