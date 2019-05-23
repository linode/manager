import { extendedTypes } from 'src/__data__/ExtendedType';
import { nodePoolRequests } from 'src/__data__/nodePools';

import {
  getMonthlyPrice,
  getTotalClusterMemoryAndCPU,
  getTotalClusterPrice
} from './kubeUtils';

jest.mock('src/store', () => ({
  default: {
    getState: () => ({
      __resources: {
        types: {
          entities: extendedTypes
        }
      }
    })
  }
}));

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
      expect(getMonthlyPrice(mockNodePool.type, mockNodePool.count)).toBe(
        expectedPrice
      );
    });

    it('should return zero for bad input', () => {
      expect(getMonthlyPrice(badNodePool.type, badNodePool.count)).toBe(0);
    });
  });

  describe('getTotalClusterPrice', () => {
    expect(getTotalClusterPrice([mockNodePool, mockNodePool])).toBe(20);
  });

  describe('Get total cluster memory/CPUs', () => {
    it('should sum up the total CPU cores of all nodes', () => {
      expect(getTotalClusterMemoryAndCPU(nodePoolRequests)).toHaveProperty(
        'CPU',
        3
      );
    });

    it('should sum up the total RAM of all pools', () => {
      expect(getTotalClusterMemoryAndCPU(nodePoolRequests)).toHaveProperty(
        'RAM',
        6144
      );
    });

    it("should return 0 if it can't match the data", () => {
      expect(getTotalClusterMemoryAndCPU([badNodePool])).toEqual({
        CPU: 0,
        RAM: 0
      });
    });

    it('should return 0 if no pools are given', () => {
      expect(getTotalClusterMemoryAndCPU([])).toEqual({ CPU: 0, RAM: 0 });
    });
  });
});
