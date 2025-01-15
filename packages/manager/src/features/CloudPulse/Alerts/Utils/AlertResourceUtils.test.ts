import { regionFactory } from 'src/factories';

import { getRegionOptions, getRegionsIdLabelMap } from './AlertResourceUtils';

import type { CloudPulseResources } from '../../shared/CloudPulseResourcesSelect';

it('test getRegionsIdLabelMap method', () => {
  let result = getRegionsIdLabelMap(undefined);

  // if regions passed undefined, it should return an empty map
  expect(Array.from(result.keys()).length).toBe(0);

  const regions = regionFactory.buildList(10);

  result = getRegionsIdLabelMap(regions);

  // check for a key
  expect(result.has(regions[0].id)).toBe(true);

  // check for value to match the region object
  expect(result.get(regions[0].id)).toBe(regions[0]);
});

it('test getRegionOptions method', () => {
  const regions = regionFactory.buildList(10);
  const regionsIdToLabelMap = getRegionsIdLabelMap(regions);
  const data: CloudPulseResources[] = [
    { id: '1', label: 'Test', region: regions[0].id },
    { id: '2', label: 'Test2', region: regions[1].id },
    { id: '3', label: 'Test3', region: regions[2].id },
  ];

  let result = getRegionOptions({
    data,
    regionsIdToLabelMap,
    resourceIds: ['1', '2'],
  });

  // Valid case
  expect(result.length).toBe(2);

  // Case with no data
  result = getRegionOptions({
    regionsIdToLabelMap,
    resourceIds: ['1', '2'],
  });
  expect(result.length).toBe(0);

  // Edge case with no matching resourceIds
  result = getRegionOptions({
    data,
    regionsIdToLabelMap,
    resourceIds: [],
  });
  expect(result.length).toBe(0);
});
