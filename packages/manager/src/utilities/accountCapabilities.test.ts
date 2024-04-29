import { isFeatureEnabled, isFeatureEnabledV2 } from './accountCapabilities';

describe('isFeatureEnabledV2', () => {
  it('returns `false` when the flag is off and the item is not in account capabilities', () => {
    expect(isFeatureEnabledV2('Object Storage', false, [])).toBe(false);
  });

  it('returns `false` when the flag is on, but the capability is not present', () => {
    expect(isFeatureEnabledV2('Object Storage', true, [])).toBe(false);
  });

  it('returns `true` when the flag is on and the account capability is present', () => {
    expect(isFeatureEnabledV2('Object Storage', true, ['Object Storage'])).toBe(
      true
    );
  });

  it('returns `false` when both the flag is on but the account capability is not present', () => {
    expect(isFeatureEnabledV2('Object Storage', true, [])).toBe(false);
  });
});

describe('isFeatureEnabled', () => {
  it('returns `false` when both the flag is off and the item is not in account capabilities', () => {
    expect(isFeatureEnabled('Object Storage', false, [])).toBe(false);
  });

  it('returns `true` when the flag is on, but the capability is not present', () => {
    expect(isFeatureEnabled('Object Storage', true, [])).toBe(true);
  });

  it('returns `true` when the flag is off, but the account capability is present', () => {
    expect(isFeatureEnabled('Object Storage', false, ['Object Storage'])).toBe(
      true
    );
  });

  it('returns `true` when both the flag is on and the account capability is present', () => {
    expect(isFeatureEnabled('Object Storage', true, ['Object Storage'])).toBe(
      true
    );
  });
});
