import { linodeTypeFactory, nodePoolFactory } from 'src/factories';
import { extendType } from 'src/utilities/extendType';

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
  const LKE_HA_PRICE = 60;

  describe('getMonthlyPrice', () => {
    it('should multiply node price by node count', () => {
      const expectedPrice = (types[0].price.monthly ?? 0) * mockNodePool.count;
      expect(
        getKubernetesMonthlyPrice({
          count: mockNodePool.count,
          region,
          type: mockNodePool.type,
          types,
        })
      ).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(
        getKubernetesMonthlyPrice({
          count: badPool.count,
          region,
          type: badPool.type,
          types,
        })
      ).toBe(undefined);
    });
  });

  describe('getTotalClusterPrice', () => {
    it('should calculate the total cluster price', () => {
      expect(
        getTotalClusterPrice({
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20);
    });

    it('should calculate the total cluster DC-specific price for a region with a price increase', () => {
      expect(
        getTotalClusterPrice({
          pools: [mockNodePool, mockNodePool],
          region: 'id-cgk',
          types,
        })
      ).toBe(48);
    });

    it('should calculate the total cluster price with HA enabled', () => {
      expect(
        getTotalClusterPrice({
          highAvailabilityPrice: LKE_HA_PRICE,
          pools: [mockNodePool, mockNodePool],
          region,
          types,
        })
      ).toBe(20 + LKE_HA_PRICE);
    });
  });
});
