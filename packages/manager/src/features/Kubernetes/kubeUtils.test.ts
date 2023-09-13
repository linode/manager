import {
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';

import { getTotalClusterMemoryCPUAndStorage } from './kubeUtils';

describe('helper functions', () => {
  const badPool = nodePoolFactory.build({
    type: 'not-a-real-type',
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
