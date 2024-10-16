import {
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import * as useFlags from 'src/hooks/useFlags';
import { extendType } from 'src/utilities/extendType';

import {
  getLatestVersion,
  getTotalClusterMemoryCPUAndStorage,
  useGetAPLAvailability,
} from './kubeUtils';

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
  describe('APL availability', () => {
    afterEach(() => {
      vi.resetAllMocks();
    });
    it('should return true if apl flag is true and beta is active', () => {
      vi.mock('@tanstack/react-query', () => ({
        useQuery: vi.fn().mockReturnValue({
          data: {
            ended: '2099-01-01T00:00:00Z',
            enrolled: '2023-01-15T00:00:00Z',
            id: 'apl',
            label: 'APL Beta',
            started: '2023-01-01T00:00:00Z',
          },
          error: null,
          isLoading: false,
        }),
      }));
      vi.spyOn(useFlags, 'useFlags').mockReturnValue({ apl: true });

      const aplAvailability = useGetAPLAvailability();

      expect(aplAvailability).toBe(true);
    });
  });
  describe('getLatestVersion', () => {
    it('should return the correct latest version from a list of versions', () => {
      const versions = [
        { label: '1.00', value: '1.00' },
        { label: '1.10', value: '1.10' },
        { label: '2.00', value: '2.00' },
      ];
      const result = getLatestVersion(versions);
      expect(result).toEqual({ label: '2.00', value: '2.00' });
    });

    it('should handle latest version minor version correctly', () => {
      const versions = [
        { label: '1.22', value: '1.22' },
        { label: '1.23', value: '1.23' },
        { label: '1.30', value: '1.30' },
      ];
      const result = getLatestVersion(versions);
      expect(result).toEqual({ label: '1.30', value: '1.30' });
    });
    it('should handle latest patch version correctly', () => {
      const versions = [
        { label: '1.22', value: '1.30' },
        { label: '1.23', value: '1.15' },
        { label: '1.30', value: '1.50.1' },
        { label: '1.30', value: '1.50' },
      ];
      const result = getLatestVersion(versions);
      expect(result).toEqual({ label: '1.50.1', value: '1.50.1' });
    });
    it('should return default fallback value when called with empty versions', () => {
      const result = getLatestVersion([]);
      expect(result).toEqual({ label: '', value: '' });
    });
  });
});
