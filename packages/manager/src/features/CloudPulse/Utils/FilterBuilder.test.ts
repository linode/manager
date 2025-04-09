import { DateTime } from 'luxon';

import { dashboardFactory } from 'src/factories';
import { databaseQueries } from 'src/queries/databases/databases';

import { RESOURCE_ID, RESOURCES } from './constants';
import {
  buildXFilter,
  checkIfAllMandatoryFiltersAreSelected,
  constructAdditionalRequestFilters,
  getCustomSelectProperties,
  getMetricsCallCustomFilters,
  getNodeTypeProperties,
  getRegionProperties,
  getResourcesProperties,
  getTagsProperties,
  getTimeDurationProperties,
  shouldDisableFilterByFilterKey,
} from './FilterBuilder';
import { deepEqual, getFilters } from './FilterBuilder';
import { FILTER_CONFIG } from './FilterConfig';
import { CloudPulseSelectTypes } from './models';

const mockDashboard = dashboardFactory.build();

const linodeConfig = FILTER_CONFIG.get('linode');

const dbaasConfig = FILTER_CONFIG.get('dbaas');

const dbaasDashboard = dashboardFactory.build({ service_type: 'dbaas' });

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

it('test getTagsProperties', () => {
  const tagsConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Tags'
  );

  expect(tagsConfig).toBeDefined();

  if (tagsConfig) {
    const { disabled, handleTagsChange, label, region, resourceType } =
      getTagsProperties(
        {
          config: tagsConfig,
          dashboard: mockDashboard,
          dependentFilters: { region: 'us-east' },
          isServiceAnalyticsIntegration: true,
        },
        vi.fn()
      );
    const { name } = tagsConfig.configuration;
    expect(handleTagsChange).toBeDefined();
    expect(disabled).toEqual(false);
    expect(label).toEqual(name);
    expect(region).toEqual('us-east');
    expect(resourceType).toEqual('linode');
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
        dashboard: mockDashboard,
        dependentFilters: { region: 'us-east' },
        isServiceAnalyticsIntegration: true,
      },
      vi.fn()
    );
    const { name } = resourceSelectionConfig.configuration;
    expect(handleResourcesSelection).toBeDefined();
    expect(savePreferences).toEqual(false);
    expect(disabled).toEqual(false);
    expect(JSON.stringify(xFilter)).toEqual('{"+and":[{"region":"us-east"}]}');
    expect(label).toEqual(name);
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
    expect(JSON.stringify(xFilter)).toEqual('{"+and":[]}');
    expect(label).toEqual(name);
  }
});

describe('shouldDisableFilterByFilterKey', () => {
  // resources filter has region as mandatory and tags as an optional filter, this should reflect in the dependent filters
  it('should enable filter when dependent filter region is provided', () => {
    const result = shouldDisableFilterByFilterKey(
      'resource_id',
      { region: 'us-east' },
      mockDashboard
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
      { region: 'us-east', tags: undefined },
      mockDashboard,
      { region: 'us-east', tags: ['tag-1'] } // tags are defined in preferences which confirms that this optional filter was selected
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

it('test buildXfilter method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined(); // fails if resources selection in not defined

  if (resourceSelectionConfig) {
    let result = buildXFilter(resourceSelectionConfig, {
      region: 'us-east',
      tags: ['test1', 'test2'],
    });

    expect(JSON.stringify(result)).toEqual(
      '{"+and":[{"region":"us-east"}],"+or":[{"tags":"test1"},{"tags":"test2"}]}'
    );

    result = buildXFilter(resourceSelectionConfig, {});

    expect(JSON.stringify(result)).toEqual('{"+and":[]}');
  }
});

it('test checkIfAllMandatoryFiltersAreSelected method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name === 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();
  const now = DateTime.now();
  let result = checkIfAllMandatoryFiltersAreSelected({
    dashboard: mockDashboard,
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
  }
});

it('test getFiltersForMetricsCallFromCustomSelect method', () => {
  const result = getMetricsCallCustomFilters(
    {
      resource_id: [1, 2, 3],
    },
    'linode'
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
      'linode'
    )
  );

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
  const filters = getFilters(
    dashboardFactory.build({ service_type: 'dbaas' }),
    true
  );

  expect(filters?.length).toBe(1);
});
