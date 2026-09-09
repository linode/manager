import { renderHook } from '@testing-library/react';

import { wrapWithProviders } from '../utilities/testHelpers';
import { useLkePermissions } from './useLkePermissions';

const queryMocks = vi.hoisted(() => ({
  useIsIAMEnabled: vi.fn().mockReturnValue({ isIAMEnabled: true }),
  useIsLkeIAMEnabled: vi.fn().mockReturnValue({ isLkeIAMEnabled: true }),
  useUserAccountPermissions: vi.fn().mockReturnValue({
    data: ['create_lkecluster'],
  }),
  useUserEntityPermissions: vi.fn().mockReturnValue({
    data: ['delete_lkecluster', 'view_lkecluster'],
  }),
  useGrants: vi.fn().mockReturnValue({ data: null }),
}));

vi.mock(import('@linode/queries'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useUserAccountPermissions: queryMocks.useUserAccountPermissions,
    useUserEntityPermissions: queryMocks.useUserEntityPermissions,
    useGrants: queryMocks.useGrants,
  };
});

vi.mock('./useIsIAMEnabled', async () => {
  const actual = await vi.importActual('./useIsIAMEnabled');
  return {
    ...actual,
    useIsIAMEnabled: queryMocks.useIsIAMEnabled,
  };
});

vi.mock('./useIsLkeIAMEnabled', async () => {
  const actual = await vi.importActual('./useIsLkeIAMEnabled');
  return {
    ...actual,
    useIsLkeIAMEnabled: queryMocks.useIsLkeIAMEnabled,
  };
});

describe('useLkePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useIsIAMEnabled.mockReturnValue({ isIAMEnabled: true });
    queryMocks.useIsLkeIAMEnabled.mockReturnValue({ isLkeIAMEnabled: true });
    queryMocks.useUserAccountPermissions.mockReturnValue({
      data: ['create_lkecluster'],
    });
    queryMocks.useUserEntityPermissions.mockReturnValue({
      data: ['delete_lkecluster', 'view_lkecluster'],
    });
    queryMocks.useGrants.mockReturnValue({ data: null });
  });

  it('uses the IAM API when iamLKE is enabled (account)', () => {
    renderHook(() => useLkePermissions('account', ['create_lkecluster']), {
      wrapper: (ui) =>
        wrapWithProviders(ui, {
          flags: { iam: { enabled: true }, iamLKE: true },
        }),
    });

    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(true);
    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
  });

  it('uses the IAM API when iamLKE is enabled (entity)', () => {
    renderHook(
      () =>
        useLkePermissions(
          'lkecluster',
          ['delete_lkecluster', 'view_lkecluster'],
          123
        ),
      {
        wrapper: (ui) =>
          wrapWithProviders(ui, {
            flags: { iam: { enabled: true }, iamLKE: true },
          }),
      }
    );

    expect(queryMocks.useUserEntityPermissions).toHaveBeenCalledWith(
      'lkecluster',
      123,
      true
    );
    expect(queryMocks.useGrants).toHaveBeenCalledWith(false);
  });

  it('uses grants when iamLKE is disabled even if global IAM is on', () => {
    queryMocks.useIsLkeIAMEnabled.mockReturnValue({ isLkeIAMEnabled: false });

    renderHook(() => useLkePermissions('account', ['create_lkecluster']), {
      wrapper: (ui) =>
        wrapWithProviders(ui, {
          flags: { iam: { enabled: true }, iamLKE: false },
        }),
    });

    expect(queryMocks.useGrants).toHaveBeenCalledWith(true);
    expect(queryMocks.useUserAccountPermissions).toHaveBeenCalledWith(false);
  });
});
