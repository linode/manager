import { getDynamicVolumePrice } from './dynamicVolumePrice';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a volumes based on size', () => {
    expect(
      getDynamicVolumePrice({
        flags: { dcSpecificPricing: true },
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.40');
  });
});
