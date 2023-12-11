import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';

import {
  getDCSpecificPrice,
  renderMonthlyPriceToCorrectDecimalPlace,
} from './dynamicPricing';
import { getDynamicVolumePrice } from './dynamicVolumePrice';

describe('getDCSpecificPricingDisplay', () => {
  it('calculates dynamic pricing for a region without an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 20,
        regionId: 'us-east',
      })
    ).toBe('20.00');
  });

  it('calculates dynamic pricing for a region with an increase', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 20,
        regionId: 'id-cgk',
      })
    ).toBe('24.00');

    expect(
      getDCSpecificPrice({
        basePrice: 20,
        regionId: 'br-gru',
      })
    ).toBe('28.00');
  });

  it('calculates dynamic pricing for a volumes based on size', () => {
    expect(
      getDynamicVolumePrice({
        regionId: 'id-cgk',
        size: 20,
      })
    ).toBe('2.40');
  });

  it('handles default case correctly', () => {
    expect(
      getDCSpecificPrice({
        basePrice: 0,
        regionId: 'invalid-region',
      })
    ).toBe(undefined);
  });
});

describe('renderMonthlyPriceToCorrectDecimalPlace', () => {
  it('renders monthly price to two decimal places if the price includes a decimal', () => {
    expect(renderMonthlyPriceToCorrectDecimalPlace(12.2)).toBe('12.20');
  });

  it('renders monthly price as an integer if the price does not include a decimal', () => {
    expect(renderMonthlyPriceToCorrectDecimalPlace(12)).toBe(12);
  });

  it('renders monthly price as --.-- (unknown price) if the price is undefined', () => {
    expect(renderMonthlyPriceToCorrectDecimalPlace(undefined)).toBe(
      UNKNOWN_PRICE
    );
  });

  it('renders monthly price as --.-- (unknown price) if the price is null', () => {
    expect(renderMonthlyPriceToCorrectDecimalPlace(null)).toBe(UNKNOWN_PRICE);
  });
});
