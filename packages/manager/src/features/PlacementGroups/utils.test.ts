import { getPlacementGroupLinodeCount } from './utils';

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        linode_ids: [1, 2, 3],
      } as any)
    ).toBe(3);
  });
});
