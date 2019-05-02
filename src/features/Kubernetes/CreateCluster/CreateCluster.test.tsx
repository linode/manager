import { extendedTypes } from 'src/__data__/ExtendedType';

import { getMonthlyPrice, getTotalClusterPrice } from './CreateCluster';

const mockNodePool = {
  type: extendedTypes[0].id,
  nodeCount: 4,
  totalMonthlyPrice: 10
};

const badNodePool = {
  type: 'not-a-real-type',
  nodeCount: 1,
  totalMonthlyPrice: 0
};

describe('CreateCluster component', () => {
  describe('helper functions', () => {
    describe('getMonthlyPrice', () => {
      it('should multiply node price by node count', () => {
        const expectedPrice =
          extendedTypes[0].price.monthly * mockNodePool.nodeCount;
        expect(getMonthlyPrice(mockNodePool, extendedTypes)).toBe(
          expectedPrice
        );
      });

      it('should return zero for bad input', () => {
        expect(getMonthlyPrice(mockNodePool)).toBe(0);
        expect(getMonthlyPrice(badNodePool)).toBe(0);
      });
    });

    describe('getTotalClusterPrice', () => {
      expect(getTotalClusterPrice([mockNodePool, mockNodePool])).toBe(20);
    });
  });
});
