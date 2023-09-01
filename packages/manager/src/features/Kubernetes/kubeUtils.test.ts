import {
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';
import { LKE_HA_PRICE } from 'src/utilities/pricing/constants';

import {
  getMonthlyPrice,
  getTotalClusterMemoryCPUAndStorage,
  getTotalClusterPrice,
} from './kubeUtils';

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
    it('should multiply node price by node count', () => {
      const expectedPrice = (types[0].price.monthly ?? 0) * mockNodePool.count;
      expect(
        getMonthlyPrice({
          count: mockNodePool.count,
          flags: { dcSpecificPricing: false },
          region,
          type: mockNodePool.type,
          types,
        })
      ).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(
        getMonthlyPrice({
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

  describe('Get total cluster memory/CPUs', () => {
    const pools = nodePoolFactory.buildList(3, {
      nodes: kubeLinodeFactory.buildList(3),
      type: 'g6-fake-1',
    });

    const types = linodeTypeFactory
      .buildList(1, {
        disk: 1048576,
        id: 'g6-fake-1',
        memory: 1024,
        vcpus: 2,
      })
      .map(extendType);

    it('should sum up the total CPU cores of all nodes', () => {
      expect(getTotalClusterMemoryCPUAndStorage(pools, types)).toHaveProperty(
        'CPU',
        2 * 9
      );
    });

    it('should sum up the total RAM of all pools', () => {
      expect(getTotalClusterMemoryCPUAndStorage(pools, types)).toHaveProperty(
        'RAM',
        1024 * 9
      );
    });

    it('should sum up the total storage of all nodes', () => {
      expect(getTotalClusterMemoryCPUAndStorage(pools, types)).toHaveProperty(
        'Storage',
        1048576 * 9
      );
    });

    it("should return 0 if it can't match the data", () => {
      expect(getTotalClusterMemoryCPUAndStorage([badPool], types)).toEqual({
        CPU: 0,
        RAM: 0,
        Storage: 0,
      });
    });

    it('should return 0 if no pools are given', () => {
      expect(getTotalClusterMemoryCPUAndStorage([], types)).toEqual({
        CPU: 0,
        RAM: 0,
        Storage: 0,
      });
    });
  });
});
