import { linodeTypeFactory } from 'src/factories';

import { getLinodeBackupPrice } from './backups';
import {
  getLinodeRegionPrice,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from './linodes';

describe('getLinodeRegionPrice', () => {
  it('gets a linode price as unknow when regionId is undefined', () => {
    const type = linodeTypeFactory.build({
      price: undefined,
      region_prices: [],
    });
    const actual = getLinodeRegionPrice(type, undefined);
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
  it('gets a linode price as unknow when regionId is undefined', () => {
    const actual = getLinodeRegionPrice(undefined, 'us-east');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
});

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

describe('getLinodeBackupPrice', () => {
  it('gets a linode backup price without a region override', () => {
    const type = linodeTypeFactory.build({
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [],
        },
      },
    });

    expect(getLinodeBackupPrice(type, 'us-east')).toEqual({
      hourly: 0.004,
      monthly: 2.5,
    });
  });

  it('gets a linode backup price with a region override', () => {
    const type = linodeTypeFactory.build({
      addons: {
        backups: {
          price: {
            hourly: 0.004,
            monthly: 2.5,
          },
          region_prices: [
            {
              hourly: 0.0048,
              id: 'id-cgk',
              monthly: 3.57,
            },
            {
              hourly: 0.0056,
              id: 'br-gru',
              monthly: 4.17,
            },
          ],
        },
      },
    });

    expect(getLinodeBackupPrice(type, 'id-cgk')).toEqual({
      hourly: 0.0048,
      monthly: 3.57,
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
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: 'us-east',
        regionB: 'us-west',
        type,
      })
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
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: 'us-east',
        regionB: 'id-cgk',
        type,
      })
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
      isLinodeTypeDifferentPriceInSelectedRegion({
        regionA: 'id-cgk',
        regionB: 'id-cgk',
        type,
      })
    ).toBe(false);
  });
});
