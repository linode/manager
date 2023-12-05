import { linodeTypeFactory } from 'src/factories';

import { getLinodeBackupPrice } from './backups';
import {
  getDynamicDCNetworkTransferData,
  getLinodeRegionPrice,
  isLinodeInDynamicPricingDC,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from './linodes';

describe('getLinodeRegionPrice', () => {
  it('gets a linode price as undefined when regionId is undefined', () => {
    const type = linodeTypeFactory.build({
      price: undefined,
      region_prices: [],
    });
    const actual = getLinodeRegionPrice(type, undefined);
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
  it('gets a linode price as undefined when type is undefined', () => {
    const actual = getLinodeRegionPrice(undefined, 'us-east');
    const expected = undefined;
    expect(actual).toEqual(expected);
  });
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

  it('returns false if there is no price difference even if we transfer between two overwritten regions', () => {
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

  describe('isLinodeInDynamicPricingDC', () => {
    const type = linodeTypeFactory.build();

    it('returns true if the linode is in a dynamic pricing DC', () => {
      expect(isLinodeInDynamicPricingDC('br-gru', type)).toBe(true);
    });

    it('returns false if the linode is not in a dynamic pricing DC', () => {
      expect(isLinodeInDynamicPricingDC('us-east', type)).toBe(false);
    });

    it('returns false if the linode region is falsy or the linode type is undefined', () => {
      expect(isLinodeInDynamicPricingDC('', type)).toBe(false);
      expect(isLinodeInDynamicPricingDC('us-east', undefined)).toBe(false);
    });
  });

  describe('getDynamicDCNetworkTransferData', () => {
    it('should return quota and used network transfer data for a given data set', () => {
      const mockData = {
        networkTransferData: {
          billable: 0,
          quota: 1000,
          region_transfers: [
            { billable: 0, id: 'id-cgk', quota: 200, used: 100 },
            { billable: 0, id: 'br-gru', quota: 300, used: 150 },
          ],
          used: 500,
        },
        regionId: 'id-cgk',
      };

      const result = getDynamicDCNetworkTransferData(mockData);

      expect(result).toEqual({ quota: 200, used: 100 });
    });

    it('should return quota and used network transfer data for a Linode with global data and valid data', () => {
      const mockData = {
        networkTransferData: {
          billable: 0,
          quota: 1000,
          used: 500,
        },
        regionId: 'id-cgk',
      };

      const result = getDynamicDCNetworkTransferData(mockData);

      expect(result).toEqual({ quota: 1000, used: 500 });
    });

    it('should return default values when data is missing', () => {
      const mockData = {
        regionId: null,
      };

      const result = getDynamicDCNetworkTransferData(mockData as any);

      expect(result).toEqual({ quota: 0, used: 0 });
    });

    it('should return default values when regionId is missing', () => {
      const mockData = {
        networkTransferData: {
          quota: 1000,
          region_transfers: [
            { id: 'us-east', quota: 200, used: 100 },
            { id: 'us-west', quota: 300, used: 150 },
          ],
          used: 500,
        },
        regionId: null,
      };

      const result = getDynamicDCNetworkTransferData(mockData as any);

      expect(result).toEqual({ quota: 0, used: 0 });
    });
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
