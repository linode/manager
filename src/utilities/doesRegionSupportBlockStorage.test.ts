import { doesRegionSupportBlockStorage } from './doesRegionSupportBlockStorage';

describe('does region support block storage', () => {
  it('returns true if the region supports block storage', () => {
    expect(doesRegionSupportBlockStorage('us-central')).toBe(true);
    expect(doesRegionSupportBlockStorage('us-east')).toBe(true);
    expect(doesRegionSupportBlockStorage('us-central')).toBe(true);
    expect(doesRegionSupportBlockStorage('ca-central')).toBe(true);
  });

  it('returns false if the region does not support block storage', () => {
    expect(doesRegionSupportBlockStorage('ap-northeast-1a')).toBe(false);
    expect(doesRegionSupportBlockStorage('us-southeast')).toBe(false);
  });
});
