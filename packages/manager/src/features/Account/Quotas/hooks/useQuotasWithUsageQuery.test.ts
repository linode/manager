import { renderHook } from '@testing-library/react';

import { volumesQuotaFactory } from 'src/factories/quotas';
import { volumesQuotaService } from 'src/features/Account/Quotas/quotaServices';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { useQuotasWithUsageQuery } from './useQuotasWithUsageQuery';

const queryMocks = vi.hoisted(() => ({
  useAllQuotasQuery: vi.fn(),
  useIsQuotasIamEnabled: vi.fn(),
  usePermissions: vi.fn(),
  useQuotaUsageQueries: vi.fn(),
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@linode/queries')>();
  return {
    ...actual,
    useAllQuotasQuery: queryMocks.useAllQuotasQuery,
    useQuotaUsageQueries: queryMocks.useQuotaUsageQueries,
  };
});

vi.mock('src/features/IAM/hooks/useIsQuotasIamEnabled', () => ({
  useIsQuotasIamEnabled: queryMocks.useIsQuotasIamEnabled,
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.usePermissions,
}));

const quota = volumesQuotaFactory.build({ quota_id: 'vol-volumes' });

const renderUseQuotasWithUsageQuery = () =>
  renderHook(
    () =>
      useQuotasWithUsageQuery({
        enabled: true,
        scope: 'region',
        scopeValue: 'us-east',
        service: volumesQuotaService,
      }),
    { wrapper: (ui) => wrapWithTheme(ui) }
  );

describe('useQuotasWithUsageQuery', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryMocks.useAllQuotasQuery.mockReturnValue({ data: [quota] });
    queryMocks.useQuotaUsageQueries.mockReturnValue([]);
  });

  it('fetches usage when the user has permission', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: true },
    });

    renderUseQuotasWithUsageQuery();

    expect(queryMocks.useQuotaUsageQueries).toHaveBeenCalledWith(
      volumesQuotaService.type,
      expect.anything(),
      expect.anything(),
      true
    );
  });

  it('disables usage queries when the user lacks permission', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: true,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: false },
    });

    renderUseQuotasWithUsageQuery();

    expect(queryMocks.useQuotaUsageQueries).toHaveBeenCalledWith(
      volumesQuotaService.type,
      expect.anything(),
      expect.anything(),
      false
    );
  });

  it('does not enforce the usage permission when Quotas RBAC is not active', () => {
    queryMocks.useIsQuotasIamEnabled.mockReturnValue({
      isQuotasIamEnabled: false,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { view_volume_quota_usage: false },
    });

    renderUseQuotasWithUsageQuery();

    expect(queryMocks.useQuotaUsageQueries).toHaveBeenCalledWith(
      volumesQuotaService.type,
      expect.anything(),
      expect.anything(),
      true
    );
  });
});
