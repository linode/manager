import { regionFactory } from '@linode/utilities';

import {
  getEndpointOptions,
  getFilteredResources,
  getOfflineRegionFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
  getSupportedRegionIds,
} from './AlertResourceUtils';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';

describe('getRegionsIdLabelMap', () => {
  it('should return a proper map for given regions', () => {
    const regions = regionFactory.buildList(10);
    const result = getRegionsIdRegionMap(regions);
    // check for a key
    expect(result.has(regions[0].id)).toBe(true);
    // check for value to match the region object
    expect(result.get(regions[0].id)).toBe(regions[0]);
  });
  it('should return 0 if regions is passed as undefined', () => {
    const result = getRegionsIdRegionMap(undefined);
    // if regions passed undefined, it should return an empty map
    expect(result.size).toBe(0);
  });
});

describe('getRegionOptions', () => {
  const regions = regionFactory.buildList(10);
  const regionsIdToLabelMap = getRegionsIdRegionMap(regions);
  const data: CloudPulseResources[] = [
    { id: '1', label: 'Test', region: regions[0].id },
    { id: '2', label: 'Test2', region: regions[1].id },
    { id: '3', label: 'Test3', region: regions[2].id },
  ];
  it('should return correct region objects for given resourceIds', () => {
    const result = getRegionOptions({
      data,
      regionsIdToRegionMap: regionsIdToLabelMap,
      resourceIds: ['1', '2'],
    });
    // Valid case
    expect(result.length).toBe(2);
  });

  it('should return an empty region options if data is not passed', () => {
    // Case with no data
    const result = getRegionOptions({
      regionsIdToRegionMap: regionsIdToLabelMap,
      resourceIds: ['1', '2'],
    });
    expect(result.length).toBe(0);
  });

  it('should return an empty region options if there is no matching resource ids', () => {
    const result = getRegionOptions({
      data,
      regionsIdToRegionMap: regionsIdToLabelMap,
      resourceIds: ['101'],
    });
    expect(result.length).toBe(0);
  });

  it('should return unique regions even if resourceIds contains duplicates', () => {
    const result = getRegionOptions({
      data,
      regionsIdToRegionMap: regionsIdToLabelMap,
      resourceIds: ['1', '1', '2', '2'], // Duplicate IDs
    });
    expect(result.length).toBe(2); // Should still return unique regions
  });
  it('should return all region objects if resourceIds is empty and isAdditionOrDeletionNeeded is true', () => {
    const result = getRegionOptions({
      data,
      isAdditionOrDeletionNeeded: true,
      regionsIdToRegionMap: regionsIdToLabelMap,
      resourceIds: [],
    });
    // Valid case
    expect(result.length).toBe(3);
  });
});

describe('getFilteredResources', () => {
  const regions = regionFactory.buildList(10);
  const regionsIdToRegionMap = getRegionsIdRegionMap(regions);
  const data: CloudPulseResources[] = [
    { id: '1', label: 'Test', region: regions[0].id },
    { id: '2', label: 'Test2', region: regions[1].id },
    { id: '3', label: 'Test3', region: regions[2].id },
  ];
  it('should return correct filtered instances on only filtered regions', () => {
    const result = getFilteredResources({
      data,
      filteredRegions: getRegionOptions({
        data,
        regionsIdToRegionMap,
        resourceIds: ['1', '2'],
      }).map(({ id, label }) => `${label} (${id})`),
      regionsIdToRegionMap,
      resourceIds: ['1', '2'],
    });
    expect(result.length).toBe(2);
    expect(result[0].label).toBe(data[0].label);
    expect(result[1].label).toBe(data[1].label);
  });
  it('should return correct filtered instances on filtered regions and search text', () => {
    const // Case with searchText
      result = getFilteredResources({
        data,
        filteredRegions: getRegionOptions({
          data,
          regionsIdToRegionMap,
          resourceIds: ['1', '2'],
        }).map(({ id, label }) => `${label} (${id})`),
        regionsIdToRegionMap,
        resourceIds: ['1', '2'],
        searchText: data[1].label,
      });
    expect(result.length).toBe(1);
    expect(result[0].label).toBe(data[1].label);
  });
  it('should return empty result on mismatched filters', () => {
    const result = getFilteredResources({
      data,
      filteredRegions: getRegionOptions({
        data,
        regionsIdToRegionMap,
        resourceIds: ['1'], // region not associated with the resources
      }).map(({ id, label }) => `${label} (${id})`),
      regionsIdToRegionMap,
      resourceIds: ['1', '2'],
      searchText: data[1].label,
    });
    expect(result.length).toBe(0);
  });
  it('should return empty result on empty data', () => {
    const result = getFilteredResources({
      data: [],
      filteredRegions: [],
      regionsIdToRegionMap,
      resourceIds: ['1', '2'],
    });
    expect(result.length).toBe(0);
  });
  it('should return empty result if data is undefined', () => {
    const result = getFilteredResources({
      data: undefined,
      filteredRegions: [],
      regionsIdToRegionMap,
      resourceIds: ['1', '2'],
    });
    expect(result.length).toBe(0);
  });
  it('should return checked true for already selected instances', () => {
    const // Case with searchText
      result = getFilteredResources({
        data,
        filteredRegions: [],
        regionsIdToRegionMap,
        resourceIds: ['1', '2'],
        searchText: '',
        selectedResources: ['1'],
      });
    expect(result.length).toBe(2);
    expect(result[0].checked).toBe(true);
  });
  it('should return all resources in case of edit flow', () => {
    const // Case with searchText
      result = getFilteredResources({
        data,
        filteredRegions: [],
        isAdditionOrDeletionNeeded: true,
        regionsIdToRegionMap,
        resourceIds: [],
        searchText: undefined,
        selectedResources: ['1'],
      });
    expect(result.length).toBe(data.length);
  });
});

describe('getSupportedRegionIds', () => {
  const regions = regionFactory.buildList(4, {
    monitors: {
      alerts: ['Linodes'],
    },
  });

  it('should return supported region ids', () => {
    const result = getSupportedRegionIds(regions, 'linode') as string[];
    expect(result.length).toBe(4);
  });
  it('should return empty list if regions list empty', () => {
    const result = getSupportedRegionIds([], 'linode');
    expect(result).toHaveLength(0);
  });
});

describe('getFilteredResources with engineType additionalFilter', () => {
  const regions = regionFactory.buildList(3);
  const regionsIdToRegionMap = getRegionsIdRegionMap(regions);

  const data: CloudPulseResources[] = [
    { id: '1', label: 'mysql-db', region: regions[0].id, engineType: 'mysql' },
    {
      id: '2',
      label: 'valkey-db-1',
      region: regions[1].id,
      engineType: 'valkey',
    },
    {
      id: '3',
      label: 'valkey-db-2',
      region: regions[2].id,
      engineType: 'valkey',
    },
    {
      id: '4',
      label: 'pg-db',
      region: regions[0].id,
      engineType: 'postgresql',
    },
  ];

  const resourceIds = data.map((d) => d.id);

  it('should return only Valkey resources when engineType filter is valkey', () => {
    const result = getFilteredResources({
      additionalFilters: {
        endpoint: undefined,
        engineType: 'valkey',
        tags: undefined,
      },
      data,
      regionsIdToRegionMap,
      resourceIds,
    });
    expect(result.length).toBe(2);
    expect(result.every((r) => r.engineType === 'valkey')).toBe(true);
  });

  it('should return only MySQL resources when engineType filter is mysql', () => {
    const result = getFilteredResources({
      additionalFilters: {
        endpoint: undefined,
        engineType: 'mysql',
        tags: undefined,
      },
      data,
      regionsIdToRegionMap,
      resourceIds,
    });
    expect(result.length).toBe(1);
    expect(result[0].engineType).toBe('mysql');
  });

  it('should return only PostgreSQL resources when engineType filter is postgresql', () => {
    const result = getFilteredResources({
      additionalFilters: {
        endpoint: undefined,
        engineType: 'postgresql',
        tags: undefined,
      },
      data,
      regionsIdToRegionMap,
      resourceIds,
    });
    expect(result.length).toBe(1);
    expect(result[0].engineType).toBe('postgresql');
  });

  it('should return all resources when engineType filter is undefined', () => {
    const result = getFilteredResources({
      additionalFilters: {
        endpoint: undefined,
        engineType: undefined,
        tags: undefined,
      },
      data,
      regionsIdToRegionMap,
      resourceIds,
    });
    expect(result.length).toBe(4);
  });

  it('should return empty when engineType filter does not match any resource', () => {
    const result = getFilteredResources({
      additionalFilters: {
        endpoint: undefined,
        engineType: 'redis',
        tags: undefined,
      },
      data,
      regionsIdToRegionMap,
      resourceIds,
    });
    expect(result.length).toBe(0);
  });
});

describe('getEndpointOptions', () => {
  const mockResources: CloudPulseResources[] = [
    { id: '1', endpoint: 'endpoint-a', region: 'us-east', label: 'r1' },
    { id: '2', endpoint: 'endpoint-b', region: 'us-east', label: 'r2' },
    { id: '3', endpoint: 'endpoint-a', region: 'us-west', label: 'r3' },
    { id: '4', endpoint: undefined, region: 'us-west', label: 'r4' },
  ];

  it('returns all unique endpoints when isAdditionOrDeletionNeeded = true', () => {
    const result = getEndpointOptions(mockResources, true);
    expect(result).toEqual(['endpoint-a', 'endpoint-b']);
  });

  it('returns endpoints only for matching resourceIds when flag = false', () => {
    const result = getEndpointOptions(mockResources, false, ['2', '4']);
    expect(result).toEqual(['endpoint-b']);
  });

  it('returns empty array when no data provided', () => {
    const result = getEndpointOptions(undefined, true);
    expect(result).toEqual([]);
  });

  it('returns empty array when no resourceIds and flag = false', () => {
    const result = getEndpointOptions(mockResources, false, []);
    expect(result).toEqual([]);
  });
});

describe('getOfflineRegionFilteredResources', () => {
  const mockResources: CloudPulseResources[] = [
    { id: '1', region: 'us-east', label: 'r1' },
    { id: '2', region: 'us-west', label: 'r2' },
    { id: '3', region: '', label: 'r3' },
  ];

  it('filters resources based on supportedRegionIds', () => {
    const result = getOfflineRegionFilteredResources(mockResources, [
      'us-east',
    ]);
    expect(result).toEqual([{ id: '1', region: 'us-east', label: 'r1' }]);
  });

  it('returns empty array if no supported regions match', () => {
    const result = getOfflineRegionFilteredResources(mockResources, [
      'eu-central',
    ]);
    expect(result).toEqual([]);
  });

  it('excludes resources with undefined region', () => {
    const result = getOfflineRegionFilteredResources(mockResources, [
      'us-east',
      'us-west',
    ]);
    expect(result).toEqual([
      { id: '1', region: 'us-east', label: 'r1' },
      { id: '2', region: 'us-west', label: 'r2' },
    ]);
  });
});
