import { regionFactory } from 'src/factories';

import { getRegionOptions, getRegionsIdRegionMap } from './AlertResourceUtils';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';

it('test getRegionsIdLabelMap method', () => {
  let result = getRegionsIdRegionMap(undefined);

  // if regions passed undefined, it should return an empty map
  expect(Array.from(result.keys()).length).toBe(0);

  const regions = regionFactory.buildList(10);

  result = getRegionsIdRegionMap(regions);

  // check for a key
  expect(result.has(regions[0].id)).toBe(true);

  // check for value to match the region object
  expect(result.get(regions[0].id)).toBe(regions[0]);
});

it('test getRegionOptions method', () => {
  const regions = regionFactory.buildList(10);
  const regionsIdToLabelMap = getRegionsIdRegionMap(regions);
  const data: CloudPulseResources[] = [
    { id: '1', label: 'Test', region: regions[0].id },
    { id: '2', label: 'Test2', region: regions[1].id },
    { id: '3', label: 'Test3', region: regions[2].id },
  ];

  let result = getRegionOptions({
    data,
    regionsIdToRegionMap: regionsIdToLabelMap,
    resourceIds: ['1', '2'],
  });

  // Valid case
  expect(result.length).toBe(2);

  // Case with no data
  result = getRegionOptions({
    regionsIdToRegionMap: regionsIdToLabelMap,
    resourceIds: ['1', '2'],
  });
  expect(result.length).toBe(0);

  // Edge case with no matching resourceIds
  result = getRegionOptions({
    data,
    regionsIdToRegionMap: regionsIdToLabelMap,
    resourceIds: [],
  });
  expect(result.length).toBe(0);
});
