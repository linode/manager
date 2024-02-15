import { placementGroupFactory, regionFactory } from 'src/factories';

import {
  affinityTypeOptions,
  getLinodesFromAllPlacementGroups,
  getPlacementGroupLinodeCount,
  hasPlacementGroupReachedCapacity,
} from './utils';

import type { PlacementGroup } from '@linode/api-v4';

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        linode_ids: [1, 2, 3],
      } as PlacementGroup)
    ).toBe(3);
  });
});

describe('affinityTypeOptions', () => {
  it('returns an array of objects with label and value properties', () => {
    expect(affinityTypeOptions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String),
        }),
      ])
    );
  });
});

describe('hasPlacementGroupReachedCapacity', () => {
  it('returns true if the linode_ids array is equal to or greater than the capacity', () => {
    expect(
      hasPlacementGroupReachedCapacity({
        placementGroup: placementGroupFactory.build({
          linode_ids: [1, 2, 3],
        }),
        region: regionFactory.build({
          maximum_vms_per_pg: 3,
        }),
      })
    ).toBe(true);
  });

  it('returns false if the linode_ids array is less than the capacity', () => {
    expect(
      hasPlacementGroupReachedCapacity({
        placementGroup: placementGroupFactory.build({
          linode_ids: [1, 2, 3],
        }),
        region: regionFactory.build({
          maximum_vms_per_pg: 4,
        }),
      })
    ).toBe(false);
  });
});

describe('getLinodesFromAllPlacementGroups', () => {
  it('returns an array of unique linode ids from all placement groups', () => {
    expect(
      getLinodesFromAllPlacementGroups([
        { linode_ids: [1, 2, 3] },
        { linode_ids: [3, 4, 5] },
      ] as PlacementGroup[])
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns an empty array if no placement groups are provided', () => {
    expect(getLinodesFromAllPlacementGroups(undefined)).toEqual([]);
  });
});
