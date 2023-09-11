import { linodeTypeFactory, nodePoolFactory } from 'src/factories';
import { extendType } from 'src/utilities/extendType';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';

import { getKubernetesMonthlyPrice, getTotalClusterPrice } from './kubernetes';

const mockNodePool = nodePoolFactory.build({
  count: 2,
  type: 'g1-fake-1',
});

const types = linodeTypeFactory
  .buildList(2, {
    id: 'g1-fake-1',
    price: {
      monthly: 5,
    },
  })
  .map(extendType);

describe('helper functions', () => {
  const badPool = nodePoolFactory.build({
    type: 'not-a-real-type',
  });
  const region = 'us_east';

  describe('getMonthlyPrice', () => {
    // it('should multiply node price by node count', () => {
    //   const expectedPrice = (types[0].price.monthly ?? 0) * mockNodePool.count;
    //   expect(
    //     getKubernetesMonthlyPrice({
    //       count: mockNodePool.count,
    //       flags: { dcSpecificPricing: false },
    //       region,
    //       type: mockNodePool.type,
    //       types,
    //     })
    //   ).toBe(expectedPrice);
    // });

    it('should return zero for bad input', () => {
      expect(
        getKubernetesMonthlyPrice({
          count: badPool.count,
          flags: { dcSpecificPricing: false },
          region,
          type: badPool.type,
          types,
        })
      ).toBe(0);
    });
  });

  describe('getTotalClusterPrice', () => {
    it('should calculate the total cluster price', () => {
      expect(
        getTotalClusterPrice({
          flags: { dcSpecificPricing: false },
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20);
    });

    it('should calculate the total cluster DC-specific price for a region with a price increase when the DC-Specific pricing feature flag is on', () => {
      expect(
        getTotalClusterPrice({
          flags: { dcSpecificPricing: true },
          pools: [mockNodePool, mockNodePool],
          region: 'id-cgk',
          types,
        })
      ).toBe(48);
    });

    it('should calculate the total cluster base price for a region with a price increase when the DC-Specific pricing feature flag is off', () => {
      expect(
        getTotalClusterPrice({
          flags: { dcSpecificPricing: false },
          pools: [mockNodePool, mockNodePool],
          region: 'id-cgk',
          types,
        })
      ).toBe(20);
    });

    it('should calculate the total cluster price with HA enabled', () => {
      expect(
        getTotalClusterPrice({
          flags: { dcSpecificPricing: false },
          highAvailabilityPrice: LKE_HA_PRICE,
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20 + LKE_HA_PRICE);
    });
  });
});
