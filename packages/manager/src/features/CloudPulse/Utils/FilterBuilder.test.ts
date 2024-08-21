import { dashboardFactory } from 'src/factories';

import {
  buildXFilter,
  checkIfAllMandatoryFiltersAreSelected,
  checkIfWeNeedToDisableFilterByFilterKey,
  constructAdditionalRequestFilters,
  getCustomSelectProperties,
  getFiltersForMetricsCallFromCustomSelect,
  getRegionProperties,
  getResourcesProperties,
  getTimeDurationProperties,
} from './FilterBuilder';
import { FILTER_CONFIG } from './FilterConfig';
import { CloudPulseSelectTypes } from './models';
import { databaseQueries } from 'src/queries/databases/databases';

const mockDashboard = dashboardFactory.build();

const linodeConfig = FILTER_CONFIG.get('linode');

const dbaasConfig = FILTER_CONFIG.get('dbaas');

it('test getRegionProperties method', () => {
  const regionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Region'
  );

  expect(regionConfig).toBeDefined();

  if (regionConfig) {
    const result = getRegionProperties(
      {
        config: regionConfig,
        dashboard: mockDashboard,
        isServiceAnalyticsIntegration: false,
      },
      vi.fn()
    );
    expect(result['handleRegionChange']).toBeDefined();
    expect(result['selectedDashboard']).toEqual(mockDashboard);
  }
});

it('test getTimeDuratonProperties method', () => {
  const timeDurationConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Time Duration'
  );

  expect(timeDurationConfig).toBeDefined();

  if (timeDurationConfig) {
    const result = getTimeDurationProperties(
      {
        config: timeDurationConfig,
        dashboard: mockDashboard,
        isServiceAnalyticsIntegration: false,
      },
      vi.fn()
    );
    expect(result['handleStatsChange']).toBeDefined();
    expect(result['savePreferences']).toEqual(true);
  }
});

it('test getResourceSelectionProperties method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  if (resourceSelectionConfig) {
    const result = getResourcesProperties(
      {
        config: resourceSelectionConfig,
        dashboard: mockDashboard,
        dependentFilters: { region: 'us-east' },
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    expect(result['handleResourcesSelection']).toBeDefined();
    expect(result['savePreferences']).toEqual(false);
    expect(result['disabled']).toEqual(false);
    expect(JSON.stringify(result['xFilter'])).toEqual(
      '{"+and":[{"region":"us-east"}]}'
    );
  }
});

it('test getResourceSelectionProperties method with disabled true', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  if (resourceSelectionConfig) {
    const result = getResourcesProperties(
      {
        config: resourceSelectionConfig,
        dashboard: mockDashboard,
        dependentFilters: {},
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    expect(result['handleResourcesSelection']).toBeDefined();
    expect(result['savePreferences']).toEqual(false);
    expect(result['disabled']).toEqual(true);
    expect(JSON.stringify(result['xFilter'])).toEqual('{"+and":[]}');
  }
});

it('test checkIfWeNeedToDisableFilterByFilterKey method all cases', () => {
  let result = checkIfWeNeedToDisableFilterByFilterKey(
    'resource_id',
    { region: 'us-east' },
    mockDashboard
  );

  expect(result).toEqual(false);

  result = checkIfWeNeedToDisableFilterByFilterKey(
    'resource_id',
    { region: undefined },
    mockDashboard
  );

  expect(result).toEqual(true);

  result = checkIfWeNeedToDisableFilterByFilterKey(
    'resource_id',
    {},
    mockDashboard
  );

  expect(result).toEqual(true);
});

it('test buildXfilter method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined(); // fails if resources selection in not defined

  if (resourceSelectionConfig) {
    let result = buildXFilter(resourceSelectionConfig, {
      region: 'us-east',
    });

    expect(JSON.stringify(result)).toEqual('{"+and":[{"region":"us-east"}]}');

    result = buildXFilter(resourceSelectionConfig, {});

    expect(JSON.stringify(result)).toEqual('{"+and":[]}');
  }
});

it('test checkIfAllMandatoryFiltersAreSelected method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  let result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: mockDashboard,
    filterValue: { region: 'us-east', resource_id: ['1', '2'] },
    timeDuration: { unit: 'min', value: 30 },
  });

  expect(result).toEqual(true);

  result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: mockDashboard,
    filterValue: { region: 'us-east' },
    timeDuration: { unit: 'min', value: 30 },
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
  let customSelectEngineConfig = dbaasConfig?.filters.find(
    (filterObj) => filterObj.name === 'DB Engine'
  );

  expect(customSelectEngineConfig).toBeDefined();

  if(customSelectEngineConfig) {
    let result = getCustomSelectProperties({
        config : customSelectEngineConfig,
        dashboard: mockDashboard,
        isServiceAnalyticsIntegration: true,
    }, vi.fn());

    expect(result.options).toBeDefined();
    expect(result.options?.length).toEqual(2);
    expect(result.savePreferences).toEqual(false);
    expect(result.isMultiSelect).toEqual(false);
    expect(result.disabled).toEqual(false);

    customSelectEngineConfig.configuration.type = CloudPulseSelectTypes.dynamic;
    customSelectEngineConfig.configuration.apiV4QueryKey = databaseQueries.engines;
    customSelectEngineConfig.configuration.isMultiSelect = true;
    customSelectEngineConfig.configuration.options = undefined;

    result = getCustomSelectProperties({
      config : customSelectEngineConfig,
      dashboard: mockDashboard,
      isServiceAnalyticsIntegration: true,
  }, vi.fn());

    expect(result.apiV4QueryKey).toEqual(databaseQueries.engines);
    expect(result.type).toEqual(CloudPulseSelectTypes.dynamic);
    expect(result.savePreferences).toEqual(false);
    expect(result.isMultiSelect).toEqual(true);
  }
});

it('test getFiltersForMetricsCallFromCustomSelect method', () => {
    let result = getFiltersForMetricsCallFromCustomSelect({
        'resource_id' : [1,2,3]
    }, 'linode');

    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
    expect(result[0].filterKey).toEqual('resource_id');
    expect(result[0].filterValue).toEqual([1,2,3]);

    // test empty case
    result = getFiltersForMetricsCallFromCustomSelect({
        'resource_test_id': [1,2,3]
    }, 'linode');
    expect(result).toBeDefined();
    expect(result.length).toEqual(0);
});

it('test constructAdditionalRequestFilters method', () => {
    let result = constructAdditionalRequestFilters(getFiltersForMetricsCallFromCustomSelect({
      'resource_id' : [1,2,3]
  }, 'linode'))

  expect(result).toBeDefined();
  expect(result.length).toEqual(1);
  expect(result[0].key).toEqual('resource_id');
  expect(result[0].operator).toEqual('in')
  expect(result[0].value).toEqual("1,2,3");

  result = constructAdditionalRequestFilters([]);

  expect(result).toBeDefined();
  expect(result.length).toEqual(0);
});
