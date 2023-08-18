import { BACKUP_PRICE } from './constants';
import { getDCSpecificPricingDisplay } from './dynamicPricing';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    expect(
      getDCSpecificPricingDisplay({
        entity: 'Backup',
        regionId: 'us-east',
      })
    ).toBe(BACKUP_PRICE.toFixed(2));
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    expect(
      getDCSpecificPricingDisplay({
        entity: 'Volume',
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.40');
  });

  it('handles default case correctly', () => {
    expect(
      getDCSpecificPricingDisplay({
        // @ts-expect-error intentionally breaking type to verify the function works
        entity: 'InvalidEntity',
        regionId: 'invalid-region',
      })
    ).toBe('0.00');
  });
});
