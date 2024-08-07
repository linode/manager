import { REGION, RESOURCE_ID } from './constants';
import {
  buildXFilter,
  checkIfAllMandatoryFiltersAreSelected,
  checkIfWeNeedToDisableFilterByFilterKey,
  getRegionProperties,
  getResourcesProperties,
  getTimeDurationProperties,
} from './FilterBuilder';
import { FILTER_CONFIG } from './FilterConfig';

const mockDashboard = {
  created: '2024-07-01',
  id: 1,
  label: 'Linod I/O dashboard',
  service_type: 'linode',
  time_duration: { unit: 'min', value: 30 },
  updated: '2024-07-01',
  widgets: [],
};

const linodeConfig = FILTER_CONFIG.get('linode');

it('test getRegionProperties method', () => {
  const regionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name == 'Region'
  );

  expect(regionConfig).toBeDefined();

  const result = getRegionProperties(
    {
      config: regionConfig!,
      dashboard: mockDashboard,
      isServiceAnalyticsIntegration: false,
    },
    vi.fn()
  );
  expect(result['handleRegionChange']).toBeDefined();
  expect(result['selectedDashboard']).toEqual(mockDashboard);
});

it('test getTimeDuratonProperties method', () => {
  const timeDurationConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name == 'Time Duration'
  );

  expect(timeDurationConfig).toBeDefined();

  const result = getTimeDurationProperties(
    {
      config: timeDurationConfig!,
      dashboard: mockDashboard,
      isServiceAnalyticsIntegration: false,
    },
    vi.fn()
  );
  expect(result['handleStatsChange']).toBeDefined();
  expect(result['savePreferences']).toEqual(true);
});

it('test getResourceSelectionProperties method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name == 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  const result = getResourcesProperties(
    {
      config: resourceSelectionConfig!,
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
});

it('test getResourceSelectionProperties method with disabled true', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name == 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  const result = getResourcesProperties(
    {
      config: resourceSelectionConfig!,
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
    (filterObj) => filterObj.name == 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  let result = buildXFilter(resourceSelectionConfig!, {
    region: 'us-east',
  });

  expect(JSON.stringify(result)).toEqual('{"+and":[{"region":"us-east"}]}');

  result = buildXFilter(resourceSelectionConfig!, {});

  expect(JSON.stringify(result)).toEqual('{"+and":[]}');
});

it('test checkIfAllMandatoryFiltersAreSelected method', () => {
  const resourceSelectionConfig = linodeConfig?.filters.find(
    (filterObj) => filterObj.name == 'Resources'
  );

  expect(resourceSelectionConfig).toBeDefined();

  let result = checkIfAllMandatoryFiltersAreSelected(
    mockDashboard,
    { region: 'us-east', resource_id: ['1', '2'] },
    { unit: 'min', value: 30 }
  );

  expect(result).toEqual(true);

  result = checkIfAllMandatoryFiltersAreSelected(
    mockDashboard,
    { region: 'us-east' },
    { unit: 'min', value: 30 }
  );

  expect(result).toEqual(false);

  result = checkIfAllMandatoryFiltersAreSelected(
    mockDashboard,
    { region: 'us-east', resource_id: ['1', '2'] },
    undefined
  );

  expect(result).toEqual(false);
});
