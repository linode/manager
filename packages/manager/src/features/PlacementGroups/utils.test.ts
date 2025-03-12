import { renderHook } from '@testing-library/react';

import {
  linodeFactory,
  placementGroupFactory,
  regionFactory,
} from 'src/factories';

import {
  getLinodesFromAllPlacementGroups,
  getMaxPGsPerCustomer,
  getPlacementGroupLinodes,
  hasPlacementGroupReachedCapacity,
  hasRegionReachedPlacementGroupCapacity,
  placementGroupTypeOptions,
  useIsPlacementGroupsEnabled,
} from './utils';

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', () => {
  const actual = vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

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

describe('affinityTypeOptions', () => {
  it('returns an array of objects with label and value properties', () => {
    expect(placementGroupTypeOptions).toEqual(
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
          placement_group_limits: {
            maximum_linodes_per_pg: 3,
          },
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
          placement_group_limits: {
            maximum_linodes_per_pg: 4,
          },
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

describe('hasRegionReachedPlacementGroupCapacity', () => {
  it('returns true if the region has reached its placement group capacity', () => {
    expect(
      hasRegionReachedPlacementGroupCapacity({
        allPlacementGroups: placementGroupFactory.buildList(3, {
          region: 'us-east',
        }),
        region: regionFactory.build({
          id: 'us-east',
          placement_group_limits: {
            maximum_pgs_per_customer: 2,
          },
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
          placement_group_limits: {
            maximum_pgs_per_customer: 4,
          },
        }),
      })
    ).toBe(false);
  });
});

describe('getPlacementGroupLinodes', () => {
  it('returns an array of linodes assigned to a placement group', () => {
    const linodes = linodeFactory.buildList(3);

    const placementGroup = placementGroupFactory.build({
      members: [
        { is_compliant: true, linode_id: 1 },
        { is_compliant: true, linode_id: 2 },
      ],
    });

    expect(getPlacementGroupLinodes(placementGroup, linodes)).toEqual([
      linodeFactory.build({
        id: 1,
        label: 'linode-1',
      }),
      linodeFactory.build({
        id: 2,
        label: 'linode-2',
      }),
    ]);
  });

  it('returns an empty array if no linodes are assigned to the placement group', () => {
    const linodes = linodeFactory.buildList(3);

    const placementGroup = placementGroupFactory.build({
      members: [],
    });

    expect(getPlacementGroupLinodes(placementGroup, linodes)).toEqual([]);
  });

  it('returns an empty array if no linodes are provided', () => {
    const linodes = undefined;

    const placementGroup = placementGroupFactory.build({
      members: [
        { is_compliant: true, linode_id: 1 },
        { is_compliant: true, linode_id: 2 },
      ],
    });

    expect(getPlacementGroupLinodes(placementGroup, linodes)).toBeUndefined();
  });

  it('returns an empty array if no placement group is provided', () => {
    const linodes = linodeFactory.buildList(3);

    const placementGroup = undefined;

    expect(getPlacementGroupLinodes(placementGroup, linodes)).toBeUndefined();
  });
});

describe('useIsPlacementGroupsEnabled', () => {
  it('returns true if the account has the Placement Group capability', () => {
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: ['Placement Group'],
      },
    });

    const { result } = renderHook(() => useIsPlacementGroupsEnabled());
    expect(result.current).toStrictEqual({
      isPlacementGroupsEnabled: true,
    });
  });

  it('returns false if the account does not have the Placement Group capability', () => {
    queryMocks.useFlags.mockReturnValue({
      placementGroups: {
        enabled: true,
      },
    });
    queryMocks.useAccount.mockReturnValue({
      data: {
        capabilities: [],
      },
    });

    const { result } = renderHook(() => useIsPlacementGroupsEnabled());
    expect(result.current).toStrictEqual({
      isPlacementGroupsEnabled: false,
    });
  });
});

describe('getMaxPGsPerCustomer', () => {
  it('returns the maximum number of Placement Groups per region a customer is allowed to create', () => {
    const region = regionFactory.build({
      placement_group_limits: {
        maximum_pgs_per_customer: 5,
      },
    });

    expect(getMaxPGsPerCustomer(region)).toBe(5);
  });

  it('returns "unlimited" if the limit is `null`', () => {
    const region = regionFactory.build({
      placement_group_limits: {
        maximum_pgs_per_customer: null,
      },
    });

    expect(getMaxPGsPerCustomer(region)).toBe('unlimited');
  });

  it('returns undefined if the region is not provided', () => {
    expect(getMaxPGsPerCustomer(undefined)).toBeUndefined();
  });
});
