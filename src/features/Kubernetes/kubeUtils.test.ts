import { extendedTypes } from 'src/__data__/ExtendedType';

import { getMonthlyPrice, getTotalClusterPrice } from './kubeUtils';

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
      expect(getMonthlyPrice(mockNodePool)).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(getMonthlyPrice(badNodePool)).toBe(0);
    });
  });

  describe('getTotalClusterPrice', () => {
    expect(getTotalClusterPrice([mockNodePool, mockNodePool])).toBe(20);
  });
});
