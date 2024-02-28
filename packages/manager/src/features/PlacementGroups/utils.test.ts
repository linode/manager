import { placementGroupFactory, regionFactory } from 'src/factories';

import {
  affinityTypeOptions,
  getAffinityEnforcement,
  getLinodesFromAllPlacementGroups,
  getPlacementGroupLinodeCount,
  hasPlacementGroupReachedCapacity,
  hasRegionReachedPlacementGroupCapacity,
} from './utils';

import type { PlacementGroup } from '@linode/api-v4';

const initialLinodeData = [
  {
    is_compliant: true,
    linode: 1,
  },
  {
    is_compliant: true,
    linode: 2,
  },
  {
    is_compliant: true,
    linode: 3,
  },
];

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        linodes: initialLinodeData,
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
          linodes: initialLinodeData,
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
          linodes: initialLinodeData,
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
        { linodes: initialLinodeData },
        {
          linodes: [
            {
              is_compliant: true,
              linode: 3,
            },
            {
              is_compliant: true,
              linode: 4,
            },
            {
              is_compliant: true,
              linode: 5,
            },
          ],
        },
      ] as PlacementGroup[])
    ).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns an empty array if no placement groups are provided', () => {
    expect(getLinodesFromAllPlacementGroups(undefined)).toEqual([]);
  });
});

describe('getAffinityEnforcement', () => {
  it('returns "Strict" if `is_strict` is true', () => {
    expect(getAffinityEnforcement(true)).toBe('Strict');
  });

  it('returns "Flexible" if `is_strict` is false', () => {
    expect(getAffinityEnforcement(false)).toBe('Flexible');
  });
});

describe('hasRegionReachedPlacementGroupCapacity', () => {
  it('returns true if the region has reached its placement group capacity', () => {
    expect(
      hasRegionReachedPlacementGroupCapacity(
        regionFactory.build({
          maximum_pgs_per_customer: 1,
        })
      )
    ).toBe(true);
  });

  it('returns false if the region has not reached its placement group capacity', () => {
    expect(
      hasRegionReachedPlacementGroupCapacity(
        regionFactory.build({
          maximum_pgs_per_customer: 0,
        })
      )
    ).toBe(false);
  });
});
