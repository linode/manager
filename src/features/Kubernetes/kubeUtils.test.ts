import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolRequests } from 'src/__data__/nodePools';

import {
  getMonthlyPrice,
  getTotalClusterMemoryAndCPU,
  getTotalClusterPrice
} from './kubeUtils';

const mockNodePool = {
  type: extendedTypes[0].id,
  count: 4,
  totalMonthlyPrice: 10
};

const badNodePool = {
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
    expect(getTotalClusterPrice([mockNodePool, mockNodePool])).toBe(20);
  });

  describe('Get total cluster memory/CPUs', () => {
    it('should sum up the total CPU cores of all nodes', () => {
      expect(
        getTotalClusterMemoryAndCPU(nodePoolRequests, extendedTypes)
      ).toHaveProperty('CPU', 3);
    });

    it('should sum up the total RAM of all pools', () => {
      expect(
        getTotalClusterMemoryAndCPU(nodePoolRequests, extendedTypes)
      ).toHaveProperty('RAM', 6144);
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
