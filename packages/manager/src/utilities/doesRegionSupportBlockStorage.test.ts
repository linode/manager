import { regions } from 'src/__data__/regionsData';
import { doesRegionSupportBlockStorage } from './doesRegionSupportBlockStorage';

describe('does region support block storage', () => {
  it('returns true if the region supports block storage', () => {
    expect(doesRegionSupportBlockStorage('us-central', regions)).toBe(true);
    expect(doesRegionSupportBlockStorage('us-east', regions)).toBe(true);
    expect(doesRegionSupportBlockStorage('us-central', regions)).toBe(true);
    expect(doesRegionSupportBlockStorage('ca-central', regions)).toBe(true);
    expect(doesRegionSupportBlockStorage('ap-west', regions)).toBe(true);
  });

  it('returns false if the region does not support block storage', () => {
    expect(doesRegionSupportBlockStorage('ap-northeast-1a', regions)).toBe(
      false
    );
    expect(doesRegionSupportBlockStorage('us-southeast', regions)).toBe(false);
  });
});
