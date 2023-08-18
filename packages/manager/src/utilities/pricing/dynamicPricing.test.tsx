import { BACKUP_PRICE } from './constants';
import { getDCSpecificPricingDisplay } from './dynamicPricing';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    expect(
      getDCSpecificPricingDisplay({
        entity: 'Backup',
        flags: { dcSpecificPricing: true },
        regionId: 'us-east',
      })
    ).toBe(BACKUP_PRICE.toFixed(2));
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    expect(
      getDCSpecificPricingDisplay({
        entity: 'Volume',
        flags: { dcSpecificPricing: true },
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.40');
  });

  it('does not apply dc specific pricing when flag is off', () => {
    expect(
      getDCSpecificPricingDisplay({
        entity: 'Volume',
        flags: { dcSpecificPricing: false },
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.00');
  });

  it('handles default case correctly', () => {
    expect(
      getDCSpecificPricingDisplay({
        // @ts-expect-error intentionally breaking type to verify the function works
        entity: 'InvalidEntity',
        flags: { dcSpecificPricing: true },
        regionId: 'invalid-region',
      })
    ).toBe('0.00');
  });
});
