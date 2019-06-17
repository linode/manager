import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolRequests } from 'src/__data__/nodePools';

import {
  getMonthlyPrice,
  getTotalClusterMemoryAndCPU,
  getTotalClusterPrice
} from './kubeUtils';

const mockNodePool = {
  id: 6,
  type: extendedTypes[0].id,
  count: 4,
  totalMonthlyPrice: 10
};

const badNodePool = {
  id: 7,
  type: 'not-a-real-type',
  count: 1,
  totalMonthlyPrice: 0
};

describe('helper functions', () => {
  describe('getMonthlyPrice', () => {
    it('should multiply node price by node count', () => {
      const expectedPrice = extendedTypes[0].price.monthly * mockNodePool.count;
      expect(
        getMonthlyPrice(mockNodePool.type, mockNodePool.count, extendedTypes)
      ).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(
        getMonthlyPrice(badNodePool.type, badNodePool.count, extendedTypes)
      ).toBe(0);
    });
  });

  describe('getTotalClusterPrice', () => {
    it('should calculate the total cluster price', () => {
      expect(getTotalClusterPrice([mockNodePool, mockNodePool])).toBe(20);
    });
  });

  describe('Get total cluster memory/CPUs', () => {
    it('should sum up the total CPU cores of all nodes', () => {
      expect(
        getTotalClusterMemoryAndCPU(nodePoolRequests, extendedTypes)
      ).toHaveProperty('CPU', 23); // 1 Nanode (1CPU) + 5 2GB (2CPU each)
    });

    it('should sum up the total RAM of all pools', () => {
      expect(
        getTotalClusterMemoryAndCPU(nodePoolRequests, extendedTypes)
      ).toHaveProperty('RAM', 47104); // 2048 + (5 * 4096)
    });

    it("should return 0 if it can't match the data", () => {
      expect(getTotalClusterMemoryAndCPU([badNodePool], extendedTypes)).toEqual(
        {
          CPU: 0,
          RAM: 0
        }
      );
    });

    it('should return 0 if no pools are given', () => {
      expect(getTotalClusterMemoryAndCPU([], extendedTypes)).toEqual({
        CPU: 0,
        RAM: 0
      });
    });
  });
});
