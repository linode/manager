import { getDCSpecificPrice } from './dynamicPricing';
import { getVolumePrice } from './entityPricing';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: getVolumePrice(20),
        flags: { dcSpecificPricing: true },
        regionId: 'us-east',
      })
    ).toBe('2.00');
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: getVolumePrice(20),
        flags: { dcSpecificPricing: true },
        regionId: 'id-cgk',
      })
    ).toBe('2.40');
  });

  it('does not apply dc specific pricing when flag is off', () => {
    expect(
      getDCSpecificPrice({
        basePrice: getVolumePrice(20),
        flags: { dcSpecificPricing: false },
        regionId: 'id-cgk',
      })
    ).toBe('2.00');
  });

  it('handles default case correctly', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 0,
        flags: { dcSpecificPricing: true },
        regionId: 'invalid-region',
      })
    ).toBe('0.00');
  });
});
