import { getStackScriptTabIndex } from './utilities';

describe('getStackScriptTabIndex', () => {
  it('should return 0 for Account', () => {
    expect(getStackScriptTabIndex('Account')).toBe(0);
  });
  it('should return 1 for Community', () => {
    expect(getStackScriptTabIndex('Community')).toBe(1);
  });
  it('should return 0 for an unexpected value', () => {
    // @ts-expect-error intentionally passing an unexpected value
    expect(getStackScriptTabIndex('hey')).toBe(0);
  });
  it('should return 0 for undefined (default to first tab)', () => {
    expect(getStackScriptTabIndex(undefined)).toBe(0);
  });
});
