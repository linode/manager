import { linodeTypeFactory } from 'src/factories';

import {
  getLinodeRegionPrice,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from './linodes';

describe('getLinodeRegionPrice', () => {
  it('gets a linode price without a region override', () => {
    const type = linodeTypeFactory.build({
      price: {
        hourly: 0.1,
        monthly: 5,
      },
      region_prices: [],
    });

    expect(getLinodeRegionPrice(type, 'us-east')).toEqual({
      hourly: 0.1,
      monthly: 5,
    });
  });
  it('gets a linode price with a region override', () => {
    const type = linodeTypeFactory.build({
      price: {
        hourly: 0.1,
        monthly: 5,
      },
      region_prices: [{ hourly: 0.2, id: 'id-cgk', monthly: 29.99 }],
    });

    expect(getLinodeRegionPrice(type, 'id-cgk')).toEqual({
      hourly: 0.2,
      monthly: 29.99,
    });
  });
});

describe('isLinodeTypeDifferentPriceInSelectedRegion', () => {
  it('returns false if there is no price difference', () => {
    const type = linodeTypeFactory.build({
      price: {
        hourly: 0.1,
        monthly: 5,
      },
      region_prices: [],
    });

    expect(
      isLinodeTypeDifferentPriceInSelectedRegion(type, 'us-east', 'us-west')
    ).toBe(false);
  });
  it('returns true if there is a price difference', () => {
    const type = linodeTypeFactory.build({
      price: {
        hourly: 0.1,
        monthly: 5,
      },
      region_prices: [{ hourly: 0.2, id: 'id-cgk', monthly: 29.99 }],
    });

    expect(
      isLinodeTypeDifferentPriceInSelectedRegion(type, 'us-east', 'id-cgk')
    ).toBe(true);
  });
  it('returns false if there is no price difference even if we transfer between two overwitten regions', () => {
    const type = linodeTypeFactory.build({
      price: {
        hourly: 0.1,
        monthly: 5,
      },
      region_prices: [
        { hourly: 0.2, id: 'id-cgk', monthly: 29.99 },
        { hourly: 0.2, id: 'br-gru', monthly: 29.99 },
      ],
    });

    expect(
      isLinodeTypeDifferentPriceInSelectedRegion(type, 'id-cgk', 'id-cgk')
    ).toBe(false);
  });
});
