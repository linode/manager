import { affinityTypeOptions, getPlacementGroupLinodeCount } from './utils';

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        linode_ids: [1, 2, 3],
      } as any)
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
