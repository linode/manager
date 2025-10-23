import { getImagesSubTabIndex } from './utilities';

describe('getStackScriptTabIndex', () => {
  it("should return 0 for 'My Custom Images' tab", () => {
    expect(getImagesSubTabIndex('custom')).toBe(0);
  });
  it("should return 1 for 'Shared with me' tab", () => {
    expect(getImagesSubTabIndex('shared')).toBe(1);
  });
  it("should return 2 for 'Recovery Images' tab", () => {
    expect(getImagesSubTabIndex('recovery')).toBe(2);
  });
  it('should return 0 for an unexpected value', () => {
    // @ts-expect-error intentionally passing an unexpected value
    expect(getImagesSubTabIndex('hey')).toBe(0);
  });
  it('should return 0 for undefined (default to first tab)', () => {
    expect(getImagesSubTabIndex(undefined)).toBe(0);
  });
});
