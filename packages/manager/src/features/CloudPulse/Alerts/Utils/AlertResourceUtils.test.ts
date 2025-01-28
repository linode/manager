import { regionFactory } from 'src/factories';

import {
  getFilteredResources,
  getRegionOptions,
  getRegionsIdRegionMap,
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
});
