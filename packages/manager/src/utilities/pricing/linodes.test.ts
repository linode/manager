import { linodeTypeFactory } from '@linode/utilities';

import {
  getDynamicDCNetworkTransferData,
  isLinodeInDynamicPricingDC,
  isLinodeTypeDifferentPriceInSelectedRegion,
} from './linodes';

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
