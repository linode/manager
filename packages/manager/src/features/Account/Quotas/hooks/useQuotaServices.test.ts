import { renderHook, waitFor } from '@testing-library/react';

import { wrapWithTheme } from 'src/utilities/testHelpers';

import { volumesQuotaService } from '../quotaServices';
import { useQuotaServices } from './useQuotaServices';

const queryMocks = vi.hoisted(() => ({
  useAccountSettings: vi.fn(),
  useIsQuotasIamEnabled: vi.fn(),
  usePermissions: vi.fn(),
  useProfile: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@linode/queries')>();
  return {
    ...actual,
    useAccountSettings: queryMocks.useAccountSettings,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('src/features/IAM/hooks/useIsQuotasIamEnabled', () => ({
  useIsQuotasIamEnabled: queryMocks.useIsQuotasIamEnabled,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

describe('useQuotaServices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useProfile.mockReturnValue({
      data: { restricted: false },
      isFetching: false,
    });
    queryMocks.useAccountSettings.mockReturnValue({
      data: { object_storage: 'active' },
      isFetching: false,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: true },
      isLoading: false,
    });
  });

  it('includes the Volumes service when the flag is on and Quotas RBAC is not active', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: true } }),
    });

    expect(result.current.data?.map((service) => service.type)).toContain(
      'volumes'
    );
    expect(result.current.restrictedServices).toEqual([]);
  });

  it('excludes the Volumes service when the flag is off', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: false } }),
    });

    expect(result.current.data?.map((service) => service.type)).not.toContain(
      'volumes'
    );
    expect(result.current.restrictedServices).toEqual([]);
  });

  it('includes the Volumes service when Quotas RBAC is active and the user has permission', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: true },
      isLoading: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: true } }),
    });

    expect(result.current.data?.map((service) => service.type)).toContain(
      'volumes'
    );
    expect(result.current.restrictedServices).toEqual([]);
  });

  it('excludes the Volumes service and reports it as restricted when Quotas RBAC is active and the user lacks permission', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: false },
      isLoading: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: true } }),
    });

    expect(result.current.data?.map((service) => service.type)).not.toContain(
      'volumes'
    );
    expect(result.current.restrictedServices).toEqual([volumesQuotaService]);
  });

  it('does not report Volumes as restricted when the flag is off, even without permission', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: false },
      isLoading: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: false } }),
    });

    expect(result.current.restrictedServices).toEqual([]);
  });

  it('is fetching while permissions are loading and Quotas RBAC is active', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: false },
      isLoading: true,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: true } }),
    });

    expect(result.current.isFetching).toBe(true);
  });

  it('is not fetching due to permissions when Quotas RBAC is not active, even if the permissions query is loading', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: false,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { list_volume_quotas: false },
      isLoading: true,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: true } }),
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('excludes Object Storage for restricted users', async () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: false,
    });
    queryMocks.useProfile.mockReturnValue({
      data: { restricted: true },
      isFetching: false,
    });

    const { result } = renderHook(() => useQuotaServices(), {
      wrapper: (ui) =>
        wrapWithTheme(ui, { flags: { blockStorageQuotas: false } }),
    });

    await waitFor(() => {
      expect(result.current.data?.map((service) => service.type)).not.toContain(
        'object-storage'
      );
    });
  });
});
