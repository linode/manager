import { getDCSpecificPrice } from './dynamicPricing';
import { getDynamicVolumePrice } from './dynamicVolumePrice';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 20,
        flags: { dcSpecificPricing: true },
        regionId: 'us-east',
      })
    ).toBe('20.00');
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 20,
        flags: { dcSpecificPricing: true },
        regionId: 'id-cgk',
      })
    ).toBe('24.00');

    expect(
      getDCSpecificPrice({
        basePrice: 20,
        flags: { dcSpecificPricing: true },
        regionId: 'br-gru',
      })
    ).toBe('28.00');
  });

  it('calculates dynamic pricing for a volumes based on size', () => {
    expect(
      getDynamicVolumePrice({
        flags: { dcSpecificPricing: true },
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.40');
  });

  it('does not apply dc specific pricing when flag is off', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 20,
        flags: { dcSpecificPricing: false },
        regionId: 'id-cgk',
      })
    ).toBe('20.00');
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
