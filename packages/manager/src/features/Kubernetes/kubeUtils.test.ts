import { renderHook, waitFor } from '@testing-library/react';

import {
  accountBetaFactory,
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { extendType } from 'src/utilities/extendType';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getLatestVersion,
  getTotalClusterMemoryCPUAndStorage,
  useAPLAvailability,
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
    it('should return true if the apl flag is true and beta is active', async () => {
      const accountBeta = accountBetaFactory.build({
        enrolled: '2023-01-15T00:00:00Z',
        id: 'apl',
      });
      server.use(
        http.get('*/account/betas/apl', () => {
          return HttpResponse.json(accountBeta);
        })
      );
      const { result } = renderHook(() => useAPLAvailability(), {
        wrapper: (ui) => wrapWithTheme(ui, { flags: { apl: true } }),
      });
      await waitFor(() => {
        expect(result.current.showAPL).toBe(true);
      });
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
