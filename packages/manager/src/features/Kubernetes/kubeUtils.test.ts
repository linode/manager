import { accountBetaFactory, linodeTypeFactory } from '@linode/utilities';
import { renderHook } from '@testing-library/react';

import {
  kubeLinodeFactory,
  kubernetesEnterpriseTierVersionFactory,
  kubernetesVersionFactory,
  nodePoolFactory,
} from 'src/factories';
import { extendType } from 'src/utilities/extendType';

import {
  compareByKubernetesVersion,
  getLatestVersion,
  getNextVersion,
  getTotalClusterMemoryCPUAndStorage,
  useAPLAvailability,
  useIsLkeEnterpriseEnabled,
  useLkeStandardOrEnterpriseVersions,
} from './kubeUtils';

import type {
  KubernetesTieredVersion,
  KubernetesVersion,
} from '@linode/api-v4';

const mockKubernetesVersions = kubernetesVersionFactory.buildList(1);
const mockKubernetesEnterpriseVersions =
  kubernetesEnterpriseTierVersionFactory.buildList(1);

const queryMocks = vi.hoisted(() => ({
  useAccount: vi.fn().mockReturnValue({}),
  useAccountBetaQuery: vi.fn().mockReturnValue({}),
  useFlags: vi.fn().mockReturnValue({}),
  useKubernetesTieredVersionsQuery: vi.fn().mockReturnValue({}),
  useKubernetesVersionQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', () => {
  const actual = vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccount: queryMocks.useAccount,
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

vi.mock('src/queries/kubernetes', () => {
  const actual = vi.importActual('src/queries/kubernetes');
  return {
    ...actual,
    useKubernetesTieredVersionsQuery:
      queryMocks.useKubernetesTieredVersionsQuery,
    useKubernetesVersionQuery: queryMocks.useKubernetesVersionQuery,
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('helper functions', () => {
  const badPool = nodePoolFactory.build({
    type: 'not-a-real-type',
  });

  describe('compareByKubernetesVersion', () => {
    it('should identify the later standard tier major version as greater', () => {
      const result = compareByKubernetesVersion('2.0.0', '1.0.0', 'asc');
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later standard tier minor version as greater', () => {
      const result = compareByKubernetesVersion('1.2.0', '1.1.0', 'asc');
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later standard tier patch version as greater', () => {
      const result = compareByKubernetesVersion('1.1.2', '1.1.1', 'asc');
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later enterprise tier major version as greater', () => {
      const result = compareByKubernetesVersion(
        'v2.0.0+lke1',
        'v1.0.0+lke2',
        'asc'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later enterprise tier minor version as greater', () => {
      const result = compareByKubernetesVersion(
        'v1.2.0+lke1',
        'v1.1.0+lke2',
        'asc'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later enterprise tier patch version as greater', () => {
      const result = compareByKubernetesVersion(
        'v1.1.2+lke1',
        'v1.1.1+lke1',
        'asc'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the enterprise tier patch version with the later enterprise release version as greater', () => {
      const result = compareByKubernetesVersion(
        'v1.1.1+lke2',
        'v1.1.1+lke1',
        'asc'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should identify the later standard tier minor version with differing number of digits', () => {
      const result = compareByKubernetesVersion('1.30', '1.3', 'asc');
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative when the first version is earlier in ascending order with standard tier versions', () => {
      const result = compareByKubernetesVersion('1.0.0', '2.0.0', 'asc');
      expect(result).toBeLessThan(0);
    });

    it('should return positive when the first version is earlier in descending order with standard tier versions', () => {
      const result = compareByKubernetesVersion('1.0.0', '2.0.0', 'desc');
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative when the first version is earlier in ascending order with enterprise tier versions', () => {
      const result = compareByKubernetesVersion(
        'v1.0.0+lke1',
        'v2.0.0+lke1',
        'asc'
      );
      expect(result).toBeLessThan(0);
    });

    it('should return positive when the first version is earlier in descending order with enterprise tier versions', () => {
      const result = compareByKubernetesVersion(
        'v1.0.0+lke1',
        'v2.0.0+lke1',
        'desc'
      );
      expect(result).toBeGreaterThan(0);
    });

    it('should return zero when standard tier versions are equal', () => {
      const result = compareByKubernetesVersion('1.2.3', '1.2.3', 'asc');
      expect(result).toEqual(0);
    });

    it('should return zero when enterprise tier versions are equal', () => {
      const result = compareByKubernetesVersion(
        'v1.2.3+lke1',
        'v1.2.3+lke1',
        'asc'
      );
      expect(result).toEqual(0);
    });
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
    it('should return the correct latest version from a list of versions in asc order', () => {
      const versions = [
        { label: '1.00', value: '1.00' },
        { label: '1.10', value: '1.10' },
        { label: '2.00', value: '2.00' },
      ];
      const result = getLatestVersion(versions);
      expect(result).toEqual({ label: '2.00', value: '2.00' });
    });

    it('should return the correct latest version from a list of versions in desc order', () => {
      const versions = [
        { label: '2.00', value: '2.00' },
        { label: '1.10', value: '1.10' },
        { label: '1.00', value: '1.00' },
      ];
      const result = getLatestVersion(versions);
      expect(result).toEqual({ label: '2.00', value: '2.00' });
    });

    it('should return the correct latest version from a list of enterprise versions in asc order', () => {
      const enterpriseVersions = [
        { label: 'v1.31.1+lke4', value: 'v1.31.1+lke4' },
        { label: 'v1.31.6+lke2', value: 'v1.31.6+lke2' },
        { label: 'v1.31.6+lke3', value: 'v1.31.6+lke3' },
        { label: 'v1.31.8+lke1', value: 'v1.31.8+lke1' },
      ];
      const result = getLatestVersion(enterpriseVersions);
      expect(result).toEqual({ label: 'v1.31.8+lke1', value: 'v1.31.8+lke1' });
    });

    it('should return the correct latest version from a list of enterprise versions in desc order', () => {
      const enterpriseVersions = [
        { label: 'v1.31.8+lke1', value: 'v1.31.8+lke1' },
        { label: 'v1.31.6+lke3', value: 'v1.31.6+lke3' },
        { label: 'v1.31.6+lke2', value: 'v1.31.6+lke2' },
        { label: 'v1.31.1+lke4', value: 'v1.31.1+lke4' },
      ];
      const result = getLatestVersion(enterpriseVersions);
      expect(result).toEqual({ label: 'v1.31.8+lke1', value: 'v1.31.8+lke1' });
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

  describe('getNextVersion', () => {
    it('should get the next version when given a current standard version', () => {
      const versions: KubernetesVersion[] = [
        { id: '1.00' },
        { id: '1.10' },
        { id: '2.00' },
      ];
      const currentVersion = '1.10';

      const result = getNextVersion(currentVersion, versions);
      expect(result).toEqual('2.00');
    });
  });

  it('should get the next version when given a current enterprise version', () => {
    const versions: KubernetesTieredVersion[] = [
      { id: 'v1.31.1+lke4', tier: 'enterprise' },
      { id: 'v1.31.6+lke2', tier: 'enterprise' },
      { id: 'v1.31.6+lke3', tier: 'enterprise' },
      { id: 'v1.31.8+lke1', tier: 'enterprise' },
    ];
    const currentVersion = 'v1.31.6+lke2';

    const result = getNextVersion(currentVersion, versions);
    expect(result).toEqual('v1.31.6+lke3');
  });

  it('should get the next version when given an obsolete current version', () => {
    const versions: KubernetesVersion[] = [
      { id: '1.16' },
      { id: '1.17' },
      { id: '1.18' },
    ];
    const currentVersion = '1.15';

    const result = getNextVersion(currentVersion, versions);
    expect(result).toEqual('1.16');
  });
});

describe('hooks', () => {
  describe('useIsLkeEnterpriseEnabled', () => {
    it('returns false for feature enablement if the account does not have the capability', () => {
      queryMocks.useAccount.mockReturnValue({
        data: {
          capabilities: [],
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
        isLkeEnterpriseGAFeatureEnabled: false,
        isLkeEnterpriseGAFlagEnabled: true,
        isLkeEnterpriseLAFeatureEnabled: false,
        isLkeEnterpriseLAFlagEnabled: true,
      });
    });

    it('returns true for LA feature enablement if the account has the capability + enabled LA feature flag values', () => {
      queryMocks.useAccount.mockReturnValue({
        data: {
          capabilities: ['Kubernetes Enterprise'],
        },
      });
      queryMocks.useFlags.mockReturnValue({
        lkeEnterprise: {
          enabled: true,
          ga: false,
          la: true,
        },
      });

      const { result } = renderHook(() => useIsLkeEnterpriseEnabled());
      expect(result.current).toStrictEqual({
        isLkeEnterpriseGAFeatureEnabled: false,
        isLkeEnterpriseGAFlagEnabled: false,
        isLkeEnterpriseLAFeatureEnabled: true,
        isLkeEnterpriseLAFlagEnabled: true,
      });
    });

    it('returns true for GA feature enablement if the account has the capability + enabled GA feature flag values', () => {
      queryMocks.useAccount.mockReturnValue({
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
        isLkeEnterpriseGAFeatureEnabled: true,
        isLkeEnterpriseGAFlagEnabled: true,
        isLkeEnterpriseLAFeatureEnabled: true,
        isLkeEnterpriseLAFlagEnabled: true,
      });
    });
  });

  describe('useLkeStandardOrEnterpriseVersions', () => {
    beforeAll(() => {
      queryMocks.useAccount.mockReturnValue({
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
      queryMocks.useKubernetesTieredVersionsQuery.mockReturnValue({
        data: mockKubernetesEnterpriseVersions,
        error: null,
        isFetching: false,
      });
      queryMocks.useKubernetesVersionQuery.mockReturnValue({
        data: mockKubernetesVersions,
        error: null,
        isLoading: false,
      });
    });

    it('returns enterprise versions for enterprise clusters when the LKE-E feature is enabled', () => {
      const { result } = renderHook(() =>
        useLkeStandardOrEnterpriseVersions('enterprise')
      );

      expect(result.current.versions).toEqual(mockKubernetesEnterpriseVersions);
      expect(result.current.isLoadingVersions).toBe(false);
      expect(result.current.versionsError).toBe(null);
    });

    it('returns standard versions for standard clusters when the LKE-E feature is enabled', () => {
      const { result } = renderHook(() =>
        useLkeStandardOrEnterpriseVersions('standard')
      );

      expect(result.current.versions).toEqual(mockKubernetesVersions);
      expect(result.current.isLoadingVersions).toBe(false);
      expect(result.current.versionsError).toBe(null);
    });

    it('returns standard versions when the LKE-E feature is disabled', () => {
      queryMocks.useFlags.mockReturnValue({
        lkeEnterprise: {
          enabled: false,
          ga: true,
          la: true,
        },
      });

      const { result } = renderHook(() =>
        useLkeStandardOrEnterpriseVersions('standard')
      );

      expect(result.current.versions).toEqual(mockKubernetesVersions);
      expect(result.current.isLoadingVersions).toBe(false);
      expect(result.current.versionsError).toBe(null);
    });
  });
});
