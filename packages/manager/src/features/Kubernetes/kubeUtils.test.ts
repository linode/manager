import { renderHook } from '@testing-library/react';

import {
  accountBetaFactory,
  kubeLinodeFactory,
  linodeTypeFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';

import {
  getLatestVersion,
  getTotalClusterMemoryCPUAndStorage,
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
} from './kubeUtils';

const queryMocks = vi.hoisted(() => ({
  useAccountBeta: vi.fn().mockReturnValue({}),
  useAccountBetaQuery: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/account/account', () => {
  const actual = vi.importActual('src/queries/account/account');
  return {
    ...actual,
    useAccountBeta: queryMocks.useAccountBeta,
  };
});

vi.mock('src/queries/account/betas/apl', () => {
  const actual = vi.importActual('src/queries/account/betas/:betaId');
  return {
    ...actual,
    useAccountBetaQuery: queryMocks.useAccountBetaQuery,
  };
});

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

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

      queryMocks.useAccountBetaQuery.mockReturnValue({
        data: accountBeta,
      });
      queryMocks.useFlags.mockReturnValue({
        apl: true,
      });

      const { result } = renderHook(() => useAPLAvailability());
      expect(result.current.showAPL).toBe(true);
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

describe('useIsLkeEnterpriseEnabled', () => {
  it('returns false if the account does not have the capability', () => {
    queryMocks.useAccountBeta.mockReturnValue({
      data: {
        capabilities: [],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      lkeEnterprise: {
        enabled: true,
        la: true,
        ga: true,
      },
    });

    const { result } = renderHook(() => useIsLkeEnterpriseEnabled());
    expect(result.current).toStrictEqual({
      isLkeEnterpriseLAEnabled: false,
      isLkeEnterpriseGAEnabled: false,
    });
  });

  it('returns true for LA if the account has the capability + enabled LA feature flag values', () => {
    queryMocks.useAccountBeta.mockReturnValue({
      data: {
        capabilities: ['Kubernetes Enterprise'],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      lkeEnterprise: {
        enabled: true,
        la: true,
        ga: false,
      },
    });

    const { result } = renderHook(() => useIsLkeEnterpriseEnabled());
    expect(result.current).toStrictEqual({
      isLkeEnterpriseLAEnabled: true,
      isLkeEnterpriseGAEnabled: false,
    });
  });

  it('returns true for GA if the account has the capability + enabled GA feature flag values', () => {
    queryMocks.useAccountBeta.mockReturnValue({
      data: {
        capabilities: ['Kubernetes Enterprise'],
      },
    });
    queryMocks.useFlags.mockReturnValue({
      lkeEnterprise: {
        enabled: true,
        ga: true,
        la: true,
      },
    });

    const { result } = renderHook(() => useIsLkeEnterpriseEnabled());
    expect(result.current).toStrictEqual({
      isLkeEnterpriseGAEnabled: true,
      isLkeEnterpriseLAEnabled: true,
    });
  });
});
