import { HIGH_AVAILABILITY_PRICE } from 'src/constants';
import {
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendedTypes } from 'src/__data__/ExtendedType';

import {
  getMonthlyPrice,
  getTotalClusterMemoryCPUAndStorage,
  getTotalClusterPrice,
} from './kubeUtils';

const mockNodePool = {
  id: 6,
  clusterID: 1,
  linodes: [],
  type: extendedTypes[0].id,
  count: 4,
  totalMonthlyPrice: 10,
  autoscaler: {
    enabled: false,
    min: 1,
    max: 1,
  },
};

describe('helper functions', () => {
  const badPool = nodePoolFactory.build({
    type: 'not-a-real-type',
  });

  describe('getMonthlyPrice', () => {
    it('should multiply node price by node count', () => {
      const expectedPrice =
        (extendedTypes[0].price.monthly ?? 0) * mockNodePool.count;
      expect(
        getMonthlyPrice(mockNodePool.type, mockNodePool.count, extendedTypes)
      ).toBe(expectedPrice);
    });

    it('should return zero for bad input', () => {
      expect(getMonthlyPrice(badPool.type, badPool.count, extendedTypes)).toBe(
        0
      );
    });
  });

  describe('getTotalClusterPrice', () => {
    it('should calculate the total cluster price', () => {
      expect(getTotalClusterPrice([mockNodePool, mockNodePool], false)).toBe(
        20
      );
    });

    it('should calculate the total cluster price with HA enabled', () => {
      expect(getTotalClusterPrice([mockNodePool, mockNodePool], true)).toBe(
        20 + (HIGH_AVAILABILITY_PRICE || 0)
      );
    });
  });

  describe('Get total cluster memory/CPUs', () => {
    const pools = nodePoolFactory.buildList(3, {
      type: 'g6-fake-1',
      nodes: kubeLinodeFactory.buildList(3),
    });

    const types = linodeTypeFactory.buildList(1, {
      id: 'g6-fake-1',
      memory: 1024,
      disk: 1048576,
      vcpus: 2,
    });

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
      expect(getTotalClusterMemoryCPUAndStorage([], extendedTypes)).toEqual({
        CPU: 0,
        RAM: 0,
        Storage: 0,
      });
    });
  });
});
