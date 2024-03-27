import { placementGroupFactory, regionFactory } from 'src/factories';

import {
  affinityTypeOptions,
  getAffinityTypeEnforcement,
  getLinodesFromAllPlacementGroups,
  getPlacementGroupLinodeCount,
  hasPlacementGroupReachedCapacity,
  hasRegionReachedPlacementGroupCapacity,
} from './utils';

import type { PlacementGroup } from '@linode/api-v4';

const initialLinodeData = [
  {
    is_compliant: true,
    linode_id: 1,
  },
  {
    is_compliant: true,
    linode_id: 2,
  },
  {
    is_compliant: true,
    linode_id: 3,
  },
];

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        members: initialLinodeData,
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
          members: initialLinodeData,
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
          members: initialLinodeData,
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
        placementGroupFactory.build({ members: initialLinodeData }),
        placementGroupFactory.build({
          members: [
            {
              is_compliant: true,
              linode_id: 3,
            },
            {
              is_compliant: true,
              linode_id: 4,
            },
            {
              is_compliant: true,
              linode_id: 5,
            },
          ],
        }),
      ])
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns an empty array if no placement groups are provided', () => {
    expect(getLinodesFromAllPlacementGroups(undefined)).toEqual([]);
  });
});

describe('getAffinityEnforcement', () => {
  it('returns "Strict" if `is_strict` is true', () => {
    expect(getAffinityTypeEnforcement(true)).toBe('Strict');
  });

  it('returns "Flexible" if `is_strict` is false', () => {
    expect(getAffinityTypeEnforcement(false)).toBe('Flexible');
  });
});

describe('hasRegionReachedPlacementGroupCapacity', () => {
  it('returns true if the region has reached its placement group capacity', () => {
    expect(
      hasRegionReachedPlacementGroupCapacity({
        allPlacementGroups: placementGroupFactory.buildList(3, {
          region: 'us-east',
        }),
        region: regionFactory.build({
          id: 'us-east',
          maximum_pgs_per_customer: 2,
        }),
      })
    ).toBe(true);
  });

  it('returns false if the region has not reached its placement group capacity', () => {
    expect(
      hasRegionReachedPlacementGroupCapacity({
        allPlacementGroups: placementGroupFactory.buildList(3, {
          region: 'us-east',
        }),
        region: regionFactory.build({
          id: 'us-east',
          maximum_pgs_per_customer: 4,
        }),
      })
    ).toBe(false);
  });
});
