import { getAffinityLabel, getPlacementGroupLinodeCount } from './utils';

describe('getAffinityLabel', () => {
  it('returns "Affinity" for "affinity" type', () => {
    expect(getAffinityLabel('affinity')).toBe('Affinity');
  });

  it('returns "Anti-Affinity" for "anti-affinity" type', () => {
    expect(getAffinityLabel('anti_affinity')).toBe('Anti-Affinity');
  });
});

describe('getPlacementGroupLinodeCount', () => {
  it('returns the length of the linode_ids array', () => {
    expect(
      getPlacementGroupLinodeCount({
        linode_ids: [1, 2, 3],
      } as any)
    ).toBe(3);
  });
});
